import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileText,
  Gauge,
  Globe2,
  Home,
  LoaderCircle,
  Play,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import "./styles.css";

const agents = [
  {
    id: "search",
    title: "Search Agent",
    label: "Discovering sources",
    description: "Finds recent and reliable links for the topic.",
    icon: Search,
    outputKey: "search_results",
  },
  {
    id: "reader",
    title: "Reader Agent",
    label: "Reading source content",
    description: "Chooses a strong URL and scrapes deeper context.",
    icon: Globe2,
    outputKey: "scraped_content",
  },
  {
    id: "writer",
    title: "Writer Chain",
    label: "Writing report",
    description: "Turns research into a structured final draft.",
    icon: FileText,
    outputKey: "report",
  },
  {
    id: "critic",
    title: "Critic Chain",
    label: "Reviewing quality",
    description: "Scores the report and suggests improvements.",
    icon: Gauge,
    outputKey: "feedback",
  },
];

const sampleTopics = [
  "AI agents in healthcare operations",
  "Future of climate tech startups",
  "Quantum computing business use cases",
  "Role of multi-agent systems in finance",
];

function App() {
  const [view, setView] = React.useState("landing");
  const [topic, setTopic] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  const [activeAgent, setActiveAgent] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState("");
  const [openPanels, setOpenPanels] = React.useState(["report"]);
  const [toast, setToast] = React.useState("");
  const [apiStatus, setApiStatus] = React.useState("checking");

  const isRunning = status === "running";
  const report = result?.report || "";
  const urls = extractUrls(`${result?.search_results || ""}\n${report}`);
  const score = getScore(result?.feedback || "");

  React.useEffect(() => {
    checkApiHealth();
    const timer = setInterval(checkApiHealth, 8000);
    return () => clearInterval(timer);
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch("/api/health");
      setApiStatus(response.ok ? "online" : "offline");
    } catch {
      setApiStatus("offline");
    }
  };

  React.useEffect(() => {
    if (!isRunning) return undefined;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(seconds);
      setActiveAgent(Math.min(agents.length - 1, Math.floor(seconds / 9)));
    }, 600);

    return () => clearInterval(timer);
  }, [isRunning]);

  const startFromLanding = () => {
    setView("studio");
    setTimeout(() => document.getElementById("topicInput")?.focus(), 350);
  };

  const runResearch = async () => {
    const cleanTopic = topic.trim();
    if (cleanTopic.length < 3) {
      showToast("Please enter a stronger topic.");
      return;
    }

    setView("studio");
    setStatus("running");
    setActiveAgent(0);
    setElapsed(0);
    setResult(null);
    setError("");
    setOpenPanels(["search"]);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: cleanTopic }),
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || "Research pipeline failed.");

      setApiStatus("online");
      setResult(payload.result);
      setStatus("complete");
      setActiveAgent(agents.length - 1);
      setOpenPanels(["report"]);
      showToast("Final report is ready.");
    } catch (err) {
      setStatus("error");
      if (isNetworkError(err)) setApiStatus("offline");
      setError(normalizeError(err));
      showToast("Pipeline stopped. Check the error panel.");
    }
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(report);
    showToast("Final report copied.");
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${topic.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "research-report"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <main>
      {view === "landing" ? (
        <LandingPage
          topic={topic}
          setTopic={setTopic}
          onEnter={startFromLanding}
          onRun={runResearch}
          apiStatus={apiStatus}
        />
      ) : (
        <StudioPage
          topic={topic}
          setTopic={setTopic}
          status={status}
          activeAgent={activeAgent}
          elapsed={elapsed}
          result={result}
          error={error}
          urls={urls}
          score={score}
          isRunning={isRunning}
          openPanels={openPanels}
          setOpenPanels={setOpenPanels}
          apiStatus={apiStatus}
          onHome={() => setView("landing")}
          onRun={runResearch}
          onCopy={copyReport}
          onDownload={downloadReport}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function LandingPage({ topic, setTopic, onEnter, onRun, apiStatus }) {
  return (
    <section className="landing">
      <div className="landing-visual" aria-hidden="true">
        <div className="grid-floor"></div>
        <span className="node node-a"></span>
        <span className="node node-b"></span>
        <span className="node node-c"></span>
        <span className="node node-d"></span>
        <div className="beam beam-a"></div>
        <div className="beam beam-b"></div>
      </div>

      <nav className="landing-nav">
        <div className="brand"><Bot size={20} /> Research Agent Studio</div>
        <div className="nav-actions">
          <ApiBadge status={apiStatus} />
          <button onClick={onEnter}>Open Studio</button>
        </div>
      </nav>

      <div className="landing-content">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> Multi-agent research automation</p>
          <h1>Turn a topic into a reviewed research report.</h1>
          <p className="hero-subtitle">
            A Groq-powered agent workflow that searches, reads, writes, critiques, and presents the final answer in a clean portfolio-grade interface.
          </p>

          <div className="hero-actions">
            <button className="primary" onClick={onEnter}>
              Start Research <ArrowRight size={18} />
            </button>
            <button className="secondary" onClick={() => setTopic("AI agents in healthcare operations")}>
              Use Example
            </button>
          </div>
        </div>

        <div className="launch-card">
          <div className="card-topline">
            <WandSparkles size={18} />
            Quick launch
          </div>
          <label htmlFor="landingTopic">Topic</label>
          <div className="landing-input">
            <input
              id="landingTopic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && onRun()}
              placeholder="Research topic..."
            />
            <button onClick={onRun}><Play size={18} /></button>
          </div>
          <div className="mini-pipeline">
            {agents.map((agent) => (
              <span key={agent.id}>{agent.title}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StudioPage({
  topic,
  setTopic,
  status,
  activeAgent,
  elapsed,
  result,
  error,
  urls,
  score,
  isRunning,
  openPanels,
  setOpenPanels,
  apiStatus,
  onHome,
  onRun,
  onCopy,
  onDownload,
}) {
  const hasResult = Boolean(result);
  const currentAgent = agents[activeAgent];

  const togglePanel = (id) => {
    setOpenPanels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <section className="studio">
      <header className="studio-header">
        <div>
          <p className="eyebrow"><Bot size={16} /> Live agent workspace</p>
          <h1>Research Studio</h1>
        </div>
        <div className="studio-actions">
          <button className="home-button" onClick={onHome}><Home size={17} /> Home</button>
          <ApiBadge status={apiStatus} />
          <div className={`run-status ${status}`}>
            {isRunning ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}
            {isRunning ? currentAgent.label : status === "complete" ? "Final report ready" : "Ready"}
          </div>
        </div>
      </header>

      <section className="studio-command">
        <div className="topic-box">
          <label htmlFor="topicInput">Enter research topic</label>
          <div className="topic-row">
            <input
              id="topicInput"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && onRun()}
              placeholder="Example: AI agents in healthcare operations"
            />
            <button onClick={onRun} disabled={isRunning}>
              {isRunning ? <LoaderCircle className="spin" size={18} /> : <Play size={18} />}
              {isRunning ? "Running" : "Run"}
            </button>
          </div>
          <div className="topic-samples">
            {sampleTopics.map((item) => (
              <button key={item} onClick={() => setTopic(item)} disabled={isRunning}>{item}</button>
            ))}
          </div>
        </div>

        <div className="metric-strip">
          <Metric label="Active agent" value={isRunning ? currentAgent.title : status === "complete" ? "Done" : "Idle"} />
          <Metric label="Sources" value={urls.length} />
          <Metric label="Score" value={score} />
          <Metric label="Elapsed" value={`${elapsed}s`} />
        </div>
      </section>

      <section className="agent-rail">
        {agents.map((agent, index) => (
          <AgentStep
            key={agent.id}
            agent={agent}
            index={index}
            activeAgent={activeAgent}
            status={status}
          />
        ))}
      </section>

      {error && <div className="error-box">{error}</div>}

      <section className="result-layout">
        <div className="agent-output-list">
          <div className="section-title">
            <span>Agent outputs</span>
            <small>Open each stage after the run completes</small>
          </div>
          {agents.map((agent) => (
            <OutputDropdown
              key={agent.id}
              agent={agent}
              isOpen={openPanels.includes(agent.id)}
              onToggle={() => togglePanel(agent.id)}
              content={result?.[agent.outputKey]}
              disabled={!hasResult}
            />
          ))}
        </div>

        <FinalReport
          report={result?.report}
          feedback={result?.feedback}
          urls={urls}
          hasResult={hasResult}
          isRunning={isRunning}
          onCopy={onCopy}
          onDownload={onDownload}
        />
      </section>
    </section>
  );
}

function ApiBadge({ status }) {
  const label = status === "online" ? "API online" : status === "offline" ? "API offline" : "Checking API";

  return (
    <span className={`api-badge ${status}`}>
      <span></span>
      {label}
    </span>
  );
}

function AgentStep({ agent, index, activeAgent, status }) {
  const Icon = agent.icon;
  const isDone = status === "complete" || (status === "running" && index < activeAgent);
  const isActive = status === "running" && index === activeAgent;

  return (
    <article className={`agent-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
      <div className="agent-icon">
        {isDone ? <Check size={20} /> : <Icon size={20} />}
      </div>
      <div>
        <h2>{agent.title}</h2>
        <p>{agent.description}</p>
      </div>
    </article>
  );
}

function OutputDropdown({ agent, isOpen, onToggle, content, disabled }) {
  const Icon = agent.icon;

  return (
    <article className={`dropdown ${isOpen ? "open" : ""}`}>
      <button onClick={onToggle} disabled={disabled}>
        <span><Icon size={18} /> {agent.title}</span>
        <ChevronDown size={18} />
      </button>
      {isOpen && (
        <div className="dropdown-body">
          {content ? <pre>{content}</pre> : <p>Output will appear here after the pipeline completes.</p>}
        </div>
      )}
    </article>
  );
}

function FinalReport({ report, feedback, urls, hasResult, isRunning, onCopy, onDownload }) {
  return (
    <article className="final-report">
      <div className="final-header">
        <div>
          <p className="eyebrow"><FileText size={15} /> Final version</p>
          <h2>Polished Report</h2>
        </div>
        <div className="final-actions">
          <button onClick={onCopy} disabled={!hasResult}><Clipboard size={16} /> Copy</button>
          <button onClick={onDownload} disabled={!hasResult}><Download size={16} /> Download</button>
        </div>
      </div>

      {!hasResult && !isRunning && (
        <div className="empty-result">
          <WandSparkles size={46} />
          <h3>Waiting for a topic</h3>
          <p>The final report, critic score, and source links will appear here.</p>
        </div>
      )}

      {isRunning && (
        <div className="empty-result loading">
          <LoaderCircle className="spin" size={46} />
          <h3>Generating final report</h3>
          <p>The backend pipeline is running. Results will unlock automatically when all agents finish.</p>
          <div className="bars"><span></span><span></span><span></span></div>
        </div>
      )}

      {hasResult && (
        <>
          <div className="report-text">{renderText(report)}</div>
          <div className="report-meta">
            <details>
              <summary>Critic feedback</summary>
              <div>{renderText(feedback)}</div>
            </details>
            <details>
              <summary>Sources</summary>
              <div className="source-links">
                {urls.length ? urls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">{url}</a>
                )) : <p>No URLs detected in output.</p>}
              </div>
            </details>
          </div>
        </>
      )}
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <article>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function renderText(text = "") {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={index} />;
    if (/^(Introduction|Key Findings|Conclusion|Sources|Strengths|Areas to Improve|One line verdict|Score):?/i.test(trimmed)) {
      return <h3 key={index}>{trimmed}</h3>;
    }
    if (/^[-*]\s/.test(trimmed)) return <li key={index}>{trimmed.replace(/^[-*]\s/, "")}</li>;
    return <p key={index}>{trimmed}</p>;
  });
}

function extractUrls(text = "") {
  return Array.from(new Set(text.match(/https?:\/\/[^\s),\]]+/g) || []));
}

function getScore(feedback = "") {
  const match = feedback.match(/Score:\s*([0-9.]+\/10)/i);
  return match ? match[1] : "--";
}

function normalizeError(err) {
  const message = err?.message || "";
  if (isNetworkError(err)) {
    return "Cannot reach the Python backend. Start it with `python app.py`, then refresh this page. If you use the React dev URL, keep both servers running: backend on 8000 and frontend on 5173.";
  }

  return message;
}

function isNetworkError(err) {
  const message = err?.message || "";
  return message === "Failed to fetch" || message.includes("NetworkError");
}

createRoot(document.getElementById("root")).render(<App />);
