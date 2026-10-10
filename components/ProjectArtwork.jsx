import {
  ArrowUpRight,
  Braces,
  Database,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
export default function ProjectArtwork({ project }) {
  return (
    <div
      className={"project-visual visual-" + project.visual}
      aria-hidden="true"
    >
      <div className="artwork-grid" />
      <div className="visual-label">
        <span className="tiny-dot" />
        {project.category}
        <span>CONCEPT VISUAL</span>
      </div>
      {project.visual === "scraper" ? (
        <div className="scraper-art">
          <div className="art-window">
            <span>extract.js</span>
            <i />
            <i />
            <i />
          </div>
          <div className="code-art">
            <span>
              01 <em>const</em> source = await collect();
            </span>
            <span>
              02 <em>const</em> data = parse(source);
            </span>
            <span>
              03 <em>return</em> structured(data);
            </span>
          </div>
          <div className="pipeline-art">
            <span>
              <Braces />
              Source
            </span>
            <i>→</i>
            <span>
              <Database />
              Structure
            </span>
            <i>→</i>
            <span>
              JSON
              <br />
              CSV
            </span>
          </div>
        </div>
      ) : project.visual === "wealth-pilot" ? (
        <div className="wealth-art">
          <div className="wealth-mark">
            w<span>p.</span>
          </div>
          <div className="wealth-orbit" />
          <div className="wealth-orbit orbit-two" />
          <div className="floating-label label-income">
            ↗ <span>Income</span>
          </div>
          <div className="floating-label label-expenses">
            ↙ <span>Expenses</span>
          </div>
          <p>A clearer view of your money.</p>
        </div>
      ) : project.visual === "grow" ? (
        <div className="grow-art">
          <span>TRULY GROW®</span>
          <strong>
            Make your
            <br />
            next move<em> matter.</em>
          </strong>
          <div className="service-line">
            WEB · SEO · MARKETING · PAID ADS <ArrowUpRight />
          </div>
        </div>
      ) : project.visual === "commerce" ? (
        <div className="commerce-art">
          <div className="shop-heading">
            <span>pickk.</span>
            <ShoppingBag size={20} />
          </div>
          <div className="product-shapes">
            <i />
            <i />
            <i />
          </div>
          <div className="shop-bottom">
            <span>Discover. Choose. Make it yours.</span>
            <ArrowUpRight size={20} />
          </div>
        </div>
      ) : (
        <div className="game-art">
          <div className="game-orbit" />
          <Sparkles className="game-star" />
          <strong>
            PLAY<span>↗</span>
          </strong>
          <div className="game-ground" />
          <p>A little curiosity. A new high score.</p>
        </div>
      )}
      <div className="visual-caption">
        <span>{project.title}</span>
        <ArrowUpRight size={16} />
      </div>
    </div>
  );
}
