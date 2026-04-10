import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import SiteLayout from "./components/SiteLayout";
import { getEnabledCategories } from "@shared/siteConfig";

// Admin Pages
import Home from "./pages/Home";
import Signals from "./pages/Signals";
import Topics from "./pages/Topics";
import Contents from "./pages/Contents";
import Reviews from "./pages/Reviews";
import Publish from "./pages/Publish";
import Accounts from "./pages/Accounts";
import ContentCalendar from "./pages/ContentCalendar";
import Website from "./pages/Website";
import Reports from "./pages/Reports";
import Insights from "./pages/Insights";
import Workflows from "./pages/Workflows";
import Team from "./pages/Team";
import Permissions from "./pages/Permissions";
import Monitor from "./pages/Monitor";
import Sources from "./pages/Sources";
import SettingsPage from "./pages/Settings";
import LoginPage from "./pages/Login";
import AiInteractions from "./pages/AiInteractions";
import DataLoop from "./pages/DataLoop";
import Comments from "./pages/Comments";
import Subscribers from "./pages/Subscribers";

// Site (Public) Pages
import SiteLanding from "./pages/SiteLanding";
import SiteCategoryPage from "./pages/SiteCategoryPage";
import SiteArticleDetail from "./pages/SiteArticleDetail";
import SiteAbout from "./pages/SiteAbout";

/* ── 后台管理路由 ── */
function DashboardRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/signals" component={Signals} />
        <Route path="/topics" component={Topics} />
        <Route path="/contents" component={Contents} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/publish" component={Publish} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/calendar" component={ContentCalendar} />
        <Route path="/website" component={Website} />
        <Route path="/reports" component={Reports} />
        <Route path="/insights" component={Insights} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/team" component={Team} />
        <Route path="/permissions" component={Permissions} />
        <Route path="/monitor" component={Monitor} />
        <Route path="/sources" component={Sources} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/ai-interactions" component={AiInteractions} />
        <Route path="/data-loop" component={DataLoop} />
        <Route path="/comments" component={Comments} />
        <Route path="/subscribers" component={Subscribers} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

/* ── 前台官网路由（配置驱动，新增板块自动注册） ── */
const enabledCategories = getEnabledCategories();

/* ── 顶层路由 ── */
function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/site/article/:id">
        {() => <SiteLayout><SiteArticleDetail /></SiteLayout>}
      </Route>
      <Route path="/site/about">
        {() => <SiteLayout><SiteAbout /></SiteLayout>}
      </Route>
      {enabledCategories.map((cat) => (
        <Route key={cat.key} path={cat.path}>
          {() => <SiteLayout><SiteCategoryPage categoryKey={cat.key} /></SiteLayout>}
        </Route>
      ))}
      <Route path="/site">
        {() => <SiteLayout><SiteLanding /></SiteLayout>}
      </Route>
      <Route component={DashboardRouter} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
