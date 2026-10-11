const { platform, arch, availableParallelism, totalmem } = require("node:os");
const fs = require("node:fs");
const path = require("node:path");
const { summarize } = require("../utils/analyze");
const { timer } = require("../clock");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 3,
});

const timeNumberFormat = Intl.NumberFormat(undefined, {
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

const valueToDuration = (maxValue, value, isTimeBased, scalingFactor = 10) => {
	const normalizedValue = isTimeBased ? maxValue / value : value / maxValue;
	const baseSpeed = (1 / normalizedValue) * scalingFactor;
	return Math.max(baseSpeed, 2); // Normalize speed with a minimum of 2 seconds
};

const escapeHTML = (str) =>
	String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

const generateHTML = (template, durations) => {
	let css = "";
	let labelDiv = "";
	let circleDiv = "";
	let position = 20;
	const colors = [
		"blue",
		"orange",
		"yellow",
		"purple",
		"black",
		"grey",
		"red",
		"green",
		"pink",
		"cyan",
	];
	for (const d of durations) {
		css += `
      #label-${d.id} {
        top: ${position}px;
      }

      #circle-${d.id} {
        background-color: ${colors.shift()};
        top: ${position}px;
      }
    `;
		circleDiv += `
      <div id="label-${d.id}" class="label">
	  ${escapeHTML(d.name)}(<span class="number">${d.metricValueFormatted}</span> ${d.metricUnit})
	  <br><span class="details">min: ${d.minFormatted}, max: ${d.maxFormatted}</span>
	  </div>
    `;
		labelDiv += `
      <div id="circle-${d.id}" class="circle"></div>
    `;

		position += 80;
	}

	const environmentDiv = `<p>Node.js version: <span class="number">${process.version}</span></p>
	<p>Platform: <span class="number">${platform()} ${arch()}</span></p>
	<p>CPU Cores: <span class="number">${availableParallelism()}</span> vCPUs | <span class="number">${(totalmem() / 1024 ** 3).toFixed(1)}GB Mem</span></p>`;

	return (
		template
			.replaceAll("{{CONTAINER_HEIGHT}}", `${durations.length * 100}px;`)
			.replaceAll("{{CSS}}", css)
			.replaceAll("{{ENVIRONMENT_DIV}}", environmentDiv)
			// Function replacers keep "$&"-like sequences in benchmark names literal
			.replaceAll("{{LABEL_DIV}}", () => labelDiv)
			.replaceAll("{{CIRCLE_DIV}}", () => circleDiv)
			.replaceAll(
				"{{DURATIONS}}",
				// Escape "<" so a benchmark name cannot close the <script> tag
				() => JSON.stringify(durations).replaceAll("<", "\\u003c"),
			)
	);
};

const templatePath = path.join(__dirname, "template.html");
const template = fs.readFileSync(templatePath, "utf8");

function htmlReport(results) {
	const summary = summarize(results);
	const primaryMetric =
		results[0]?.opsSec !== undefined ? "opsSec" : "totalTime";
	let durations;

	if (primaryMetric === "opsSec") {
		const maxOpsSec = Math.max(...summary.map((b) => b.opsSec));
		durations = summary.map((r, i) => ({
			id: `bench-${i}`,
			name: r.name,
			duration: valueToDuration(maxOpsSec, r.opsSec, false),
			metricValueFormatted: formatter.format(r.opsSec),
			metricUnit: "ops/sec",
			minFormatted: timer.format(r.min), // Use timer for ns format
			maxFormatted: timer.format(r.max),
		}));
	} else {
		// metric === 'totalTime'
		const maxTotalTime = Math.max(...summary.map((b) => b.totalTime));
		durations = summary.map((r, i) => ({
			id: `bench-${i}`,
			name: r.name,
			duration: valueToDuration(maxTotalTime, r.totalTime, true),
			metricValueFormatted: r.totalTimeFormatted,
			metricUnit: "total time",
			minFormatted: timer.format(r.min), // Use timer for ns format
			maxFormatted: timer.format(r.max),
		}));
	}

	const htmlContent = generateHTML(template, durations);
	fs.writeFileSync("result.html", htmlContent, "utf8");
	process.stdout.write("HTML file has been generated: result.html\n");
}

module.exports = {
	htmlReport,
};
