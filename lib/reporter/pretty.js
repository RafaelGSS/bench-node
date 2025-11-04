const { styleText } = require("../utils/styleText");
const os = require("node:os");
const { analyze, summarize } = require("../utils/analyze.js");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

const BOX_VERTICAL = "│";
const BOX_HORIZONTAL = "─";
const BOX_CORNER_BOTTOM_LEFT = "└";
const BOX_TEE_RIGHT = "├";

/**
 * Pretty print format a report.
 * @param {BenchmarkResult[]} results
 */
function prettyReport(results) {
	process.stdout.write(toPretty(results));
}

/**
 * Pretty print format a report.
 * @param {BenchmarkResult[]} results
 * @returns {string} the formatted report
 */
function toPretty(results) {
	if (results.length === 0) {
		return "";
	}

	const cpu = os.cpus()[0];

	let text = styleText("bold", "\nSystem Information:\n");
	text += `  Node.js: ${process.version}\n`;
	text += `  OS: ${os.platform()} ${os.release()}\n`;
	text += `  CPU: ${cpu.model}\n`;

	const hasBaseline = results.find((result) => result.baseline) !== undefined;

	if (hasBaseline) {
		text += `\nLegend: ${styleText("magenta", "■")} Baseline\n\n`;
	}

	text += styleText("bold", `Benchmark results (${results.length} total):\n`);

	const firstResult = results[0];
	if (firstResult && firstResult.plugins.length > 0) {
		const pluginNames = firstResult.plugins.map((p) => p.name).join(", ");
		text += styleText("dim", `Plugins enabled: ${pluginNames}\n`);
	}

	const tree = buildTree(results);
	text += formatTree(tree);

	if (hasBaseline) {
		text += styleText("bold", "\n\nSummary (vs. baseline):\n");

		const sortedResults = analyze(results);
		const maxNameLength = Math.max(...sortedResults.map((r) => r.name.length));

		for (const result of sortedResults) {
			const namePart = `  ${result.name.padEnd(maxNameLength)}  `;
			text += namePart;

			if (result.baseline) {
				text += styleText("magenta", "(baseline)");
			} else if (!result.comparison.startsWith("-")) {
				text += styleText("green", `(${result.comparison}x faster)`);
			} else {
				text += styleText("red", `(${result.comparison.slice(1)}x slower)`);
			}

			text += "\n";
		}
	}

	text += "\n";

	return text;
}

function buildTree(results) {
	const tree = { children: new Map() };
	const summary = summarize(results);

	for (const result of summary) {
		const parts = result.name.split("/");
		let currentNode = tree;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!currentNode.children.has(part)) {
				currentNode.children.set(part, { children: new Map() });
			}
			currentNode = currentNode.children.get(part);

			if (i === parts.length - 1) {
				currentNode.result = result;
			}
		}
	}

	return tree;
}

function formatTree(node, prefix = "", isLast = true) {
	const children = Array.from(node.children.entries());

	let tree = "";

	for (let i = 0; i < children.length; i++) {
		const [name, childNode] = children[i];
		const isCurrentLast = i === children.length - 1;
		const connector = isCurrentLast
			? `${BOX_CORNER_BOTTOM_LEFT}${BOX_HORIZONTAL}`
			: `${BOX_TEE_RIGHT}${BOX_HORIZONTAL}`;

		const prefixStyled = styleText("dim", `${prefix}${connector}`);

		tree += prefixStyled;

		if (!childNode.result) {
			// This is a group
			tree += ` ${styleText(["bold", "yellow"], name)}`;
		} else {
			const style = ["bold"];
			if (childNode.result.baseline) {
				style.push("magenta");
			}

			const nameStyled = ` ${styleText(style, name)}`;
			tree += nameStyled;
			const prefixUnstyled = `${prefix}${connector}`;
			const nameUnstyled = ` ${name}`;
			const unstyledLength = prefixUnstyled.length + nameUnstyled.length;
			tree += resultLine(childNode.result, unstyledLength);
		}

		tree += "\n";

		const newPrefix = `${prefix}${isCurrentLast ? "  " : `${BOX_VERTICAL} `}`;
		if (childNode.children.size > 0) {
			tree += formatTree(childNode, newPrefix, isCurrentLast);
		}
	}

	return tree;
}

function resultLine(result, prefixLength) {
	const PADDING = 55;
	const padding = PADDING - prefixLength > 0 ? PADDING - prefixLength : 0;

	let line = " ".repeat(padding);

	const color = "blue";

	if (result.opsSec !== undefined) {
		line += styleText(["bold"], `${formatter.format(result.opsSec)} ops/sec`);
	} else if (result.totalTime !== undefined) {
		line += styleText([color, "bold"], `${result.timeFormatted} total time`);
	}

	if (result.runsSampled) {
		line += ` (${result.runsSampled} runs sampled) `;
		line += "min..max=(";
		line += styleText("green", result.minFormatted);
		line += styleText("dim", "...");
		line += styleText("red", result.maxFormatted);
		line += ")";
	}

	return line;
}

module.exports = {
	prettyReport,
	toPretty,
};
