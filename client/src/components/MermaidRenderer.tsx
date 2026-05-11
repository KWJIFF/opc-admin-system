import { useEffect, useRef, useState } from "react";

/**
 * Mermaid 图表渲染组件
 * 接收 Markdown 正文，检测其中的 ```mermaid 代码块并渲染为 SVG
 */
export function useMermaidRenderer(containerRef: React.RefObject<HTMLElement | null>) {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!containerRef.current || rendered) return;

    const container = containerRef.current;
    const codeBlocks = container.querySelectorAll("pre code.language-mermaid, pre code.lang-mermaid");

    if (codeBlocks.length === 0) {
      // Also check for <code> blocks that contain mermaid class via streamdown
      const allPre = container.querySelectorAll("pre");
      const mermaidPres: HTMLElement[] = [];
      allPre.forEach((pre) => {
        const code = pre.querySelector("code");
        if (code) {
          const className = code.className || "";
          const textContent = pre.textContent || "";
          if (
            className.includes("mermaid") ||
            className.includes("language-mermaid") ||
            (textContent.trim().startsWith("graph ") ||
             textContent.trim().startsWith("flowchart ") ||
             textContent.trim().startsWith("pie") ||
             textContent.trim().startsWith("xychart") ||
             textContent.trim().startsWith("sequenceDiagram") ||
             textContent.trim().startsWith("classDiagram") ||
             textContent.trim().startsWith("stateDiagram") ||
             textContent.trim().startsWith("erDiagram") ||
             textContent.trim().startsWith("gantt") ||
             textContent.trim().startsWith("journey") ||
             textContent.trim().startsWith("quadrantChart") ||
             textContent.trim().startsWith("mindmap") ||
             textContent.trim().startsWith("timeline") ||
             textContent.trim().startsWith("radar"))
          ) {
            mermaidPres.push(pre);
          }
        }
      });

      if (mermaidPres.length === 0) return;

      // Dynamic import mermaid
      import("mermaid").then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          themeVariables: {
            primaryColor: "#e44106",
            primaryTextColor: "#1a1a1a",
            primaryBorderColor: "#e44106",
            lineColor: "#666",
            secondaryColor: "#fff3e0",
            tertiaryColor: "#f5f5f5",
            fontFamily: "'Noto Serif SC', 'Playfair Display', serif",
          },
          flowchart: { useMaxWidth: true, htmlLabels: true },
          pie: { useMaxWidth: true },
        });

        mermaidPres.forEach(async (pre, index) => {
          const code = pre.querySelector("code");
          if (!code) return;
          let chartDef = code.textContent || "";
          // Fix: Markdown renderer may escape brackets/parens in mermaid code
          chartDef = chartDef.replace(/\\\[/g, '[').replace(/\\\]/g, ']');
          chartDef = chartDef.replace(/\\\(/g, '(').replace(/\\\)/g, ')');
          chartDef = chartDef.replace(/\\_/g, '_');
          try {
            const id = `mermaid-chart-${Date.now()}-${index}`;
            const { svg } = await mermaid.render(id, chartDef.trim());
            const wrapper = document.createElement("div");
            wrapper.className = "mermaid-chart-wrapper";
            wrapper.innerHTML = svg;
            pre.replaceWith(wrapper);
          } catch (err) {
            console.warn("Mermaid render failed:", err);
            // Keep original code block visible
            pre.classList.add("mermaid-error");
          }
        });
        setRendered(true);
      });
      return;
    }

    // Standard path: code blocks with language-mermaid class
    import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        themeVariables: {
          primaryColor: "#e44106",
          primaryTextColor: "#1a1a1a",
          primaryBorderColor: "#e44106",
          lineColor: "#666",
          secondaryColor: "#fff3e0",
          tertiaryColor: "#f5f5f5",
          fontFamily: "'Noto Serif SC', 'Playfair Display', serif",
        },
        flowchart: { useMaxWidth: true, htmlLabels: true },
        pie: { useMaxWidth: true },
      });

      codeBlocks.forEach(async (codeEl, index) => {
        const pre = codeEl.parentElement;
        if (!pre) return;
        let chartDef = codeEl.textContent || "";
        // Fix: Markdown renderer may escape brackets/parens in mermaid code
        chartDef = chartDef.replace(/\\\[/g, '[').replace(/\\\]/g, ']');
        chartDef = chartDef.replace(/\\\(/g, '(').replace(/\\\)/g, ')');
        chartDef = chartDef.replace(/\\_/g, '_');
        try {
          const id = `mermaid-chart-${Date.now()}-${index}`;
          const { svg } = await mermaid.render(id, chartDef.trim());
          const wrapper = document.createElement("div");
          wrapper.className = "mermaid-chart-wrapper";
          wrapper.innerHTML = svg;
          pre.replaceWith(wrapper);
        } catch (err) {
          console.warn("Mermaid render failed:", err);
          pre.classList.add("mermaid-error");
        }
      });
      setRendered(true);
    });
  }, [containerRef, rendered]);

  // Reset rendered state when content changes
  const reset = () => setRendered(false);
  return { reset };
}
