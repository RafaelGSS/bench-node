const { platform, arch, availableParallelism, totalmem } = require("node:os");
const fs = require("node:fs");
const path = require("node:path");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 3,
});

const timer = Intl.NumberFormat(undefined, {
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

const formatTime = (time) => {
	if (time < 0.000001) {
		// Less than 1 microsecond, show in nanoseconds
		return `${(time * 1000000000).toFixed(2)} ns`;
	} else if (time < 0.001) {
		// Less than 1 millisecond, show in microseconds
		return `${(time * 1000000).toFixed(2)} µs`;
	} else if (time < 1) {
		// Less than 1 second, show in milliseconds
		return `${(time * 1000).toFixed(2)} ms`;
	} else {
		// 1 second or more, show in seconds
		return `${time.toFixed(2)} s`;
	}
};

const valueToDuration = (maxValue, value, isTimeBased, scalingFactor = 10) => {
	const normalizedValue = isTimeBased ? maxValue / value : value / maxValue;
	const baseSpeed = (1 / normalizedValue) * scalingFactor;
	return Math.max(baseSpeed, 2); // Normalize speed with a minimum of 2 seconds
};

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
      #label-${d.name} {
        top: ${position}px;
      }

      #circle-${d.name} {
        background-color: ${colors.shift()};
        top: ${position}px;
      }
    `;
		circleDiv += `
      <div id="label-${d.name}" class="label">
	  ${d.name}(<span class="number">${d.metricValueFormatted}</span> ${d.metricUnit})
	  <br><span class="details">min: ${d.minFormatted}, max: ${d.maxFormatted}</span>
	  </div>
    `;
		labelDiv += `
      <div id="circle-${d.name}" class="circle"></div>
    `;

		position += 80;
	}

	const environmentDiv = `<p>Node.js version: <span class="number">${process.version}</span></p>
	<p>Platform: <span class="number">${platform()} ${arch()}</span></p>
	<p>CPU Cores: <span class="number">${availableParallelism()}</span> vCPUs | <span class="number">${(totalmem() / 1024 ** 3).toFixed(1)}GB Mem</span></p>`;

	return template
		.replaceAll("{{CONTAINER_HEIGHT}}", `${durations.length * 100}px;`)
		.replaceAll("{{CSS}}", css)
		.replaceAll("{{ENVIRONMENT_DIV}}", environmentDiv)
		.replaceAll("{{LABEL_DIV}}", labelDiv)
		.replaceAll("{{CIRCLE_DIV}}", circleDiv)
		.replaceAll("{{DURATIONS}}", JSON.stringify(durations));
};

const templatePath = path.join(__dirname, "template.html");
const template = fs.readFileSync(templatePath, "utf8");

function htmlReport(results) {
	const primaryMetric =
		results[0]?.opsSec !== undefined ? "opsSec" : "totalTime";
	let durations;

	if (primaryMetric === "opsSec") {
		const maxOpsSec = Math.max(...results.map((b) => b.opsSec));
		durations = results.map((r) => ({
			name: r.name.replaceAll(" ", "-"),
			duration: valueToDuration(maxOpsSec, r.opsSec, false),
			metricValueFormatted: formatter.format(r.opsSec),
			metricUnit: "ops/sec",
			minFormatted: timer.format(r.histogram.min), // Use timer for ns format
			maxFormatted: timer.format(r.histogram.max),
		}));
	} else {
		// metric === 'totalTime'
		const maxTotalTime = Math.max(...results.map((b) => b.totalTime));
		durations = results.map((r) => ({
			name: r.name.replaceAll(" ", "-"),
			duration: valueToDuration(maxTotalTime, r.totalTime, true),
			metricValueFormatted: formatTime(r.totalTime),
			metricUnit: "total time",
			minFormatted: timer.format(r.histogram.min), // Use timer for ns format
			maxFormatted: timer.format(r.histogram.max),
		}));
	}

	const htmlContent = generateHTML(template, durations);
	fs.writeFileSync("result.html", htmlContent, "utf8");
	process.stdout.write("HTML file has been generated: result.html\n");
}

module.exports = {
	htmlReport,
};
