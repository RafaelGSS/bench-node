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
 * @param {import('../report').BenchmarkResult[]} results
 */
function prettyReport(results) {
	if (results.length === 0) {
		return;
	}

	const cpu = os.cpus()[0];
	process.stdout.write(styleText("bold", "\nSystem Information:\n"));
	process.stdout.write(`  Node.js: ${process.version}\n`);
	process.stdout.write(`  OS: ${os.platform()} ${os.release()}\n`);
	process.stdout.write(`  CPU: ${cpu.model}\n`);

	const hasBaseline = results.find((result) => result.baseline) !== undefined;

	if (hasBaseline) {
		process.stdout.write(`\nLegend: ${styleText("magenta", "■")} Baseline\n\n`);
	}

	process.stdout.write(
		styleText("bold", `Benchmark results (${results.length} total):\n`),
	);

	const firstResult = results[0];
	if (firstResult && firstResult.plugins.length > 0) {
		const pluginNames = firstResult.plugins.map((p) => p.name).join(", ");
		process.stdout.write(styleText("dim", `Plugins enabled: ${pluginNames}\n`));
	}

	const tree = buildTree(results);
	printTree(tree);

	if (hasBaseline) {
		process.stdout.write(styleText("bold", "\n\nSummary (vs. baseline):\n"));

		const sortedResults = analyze(results);

		const maxNameLength = Math.max(...sortedResults.map((r) => r.name.length));

		for (const result of sortedResults) {
			const namePart = `  ${result.name.padEnd(maxNameLength)}  `;
			process.stdout.write(namePart);

			if (result.baseline) {
				process.stdout.write(styleText("magenta", "(baseline)"));
			} else if (!result.comparison.startsWith("-")) {
				process.stdout.write(
					styleText("green", `(${result.comparison}x faster)`),
				);
			} else {
				process.stdout.write(
					styleText("red", `(${result.comparison.slice(1)}x slower)`),
				);
			}
			process.stdout.write("\n");
		}
	}

	process.stdout.write("\n");
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

function printTree(node, prefix = "", isLast = true) {
	const children = Array.from(node.children.entries());
	for (let i = 0; i < children.length; i++) {
		const [name, childNode] = children[i];
		const isCurrentLast = i === children.length - 1;
		const connector = isCurrentLast
			? `${BOX_CORNER_BOTTOM_LEFT}${BOX_HORIZONTAL}`
			: `${BOX_TEE_RIGHT}${BOX_HORIZONTAL}`;

		const prefixStyled = styleText("dim", `${prefix}${connector}`);

		if (childNode.result) {
			const style = ["bold"];
			if (childNode.result.baseline) {
				style.push("magenta");
			}
			const nameStyled = ` ${styleText(style, name)}`;
			process.stdout.write(prefixStyled);
			process.stdout.write(nameStyled);
			const prefixUnstyled = `${prefix}${connector}`;
			const nameUnstyled = ` ${name}`;
			const unstyledLength = prefixUnstyled.length + nameUnstyled.length;
			printResult(childNode.result, unstyledLength);
		} else {
			// This is a group
			const nameStyled = ` ${styleText(["bold", "yellow"], name)}`;
			process.stdout.write(prefixStyled);
			process.stdout.write(nameStyled);
		}

		process.stdout.write("\n");

		const newPrefix = `${prefix}${isCurrentLast ? "  " : `${BOX_VERTICAL} `}`;
		if (childNode.children.size > 0) {
			printTree(childNode, newPrefix, isCurrentLast);
		}
	}
}

function printResult(result, prefixLength) {
	const PADDING = 55;
	const padding = PADDING - prefixLength > 0 ? PADDING - prefixLength : 0;
	process.stdout.write(" ".repeat(padding));

	const color = "blue";

	if (result.opsSec !== undefined) {
		process.stdout.write(
			styleText(["bold"], `${formatter.format(result.opsSec)} ops/sec`),
		);
	} else if (result.totalTime !== undefined) {
		process.stdout.write(
			styleText([color, "bold"], `${result.timeFormatted} total time`),
		);
	}

	if (result.runsSampled) {
		process.stdout.write(` (${result.runsSampled} runs sampled) `);
		process.stdout.write("min..max=(");
		process.stdout.write(styleText("green", result.minFormatted));
		process.stdout.write(styleText("dim", "..."));
		process.stdout.write(styleText("red", result.maxFormatted));
		process.stdout.write(")");
	}
}

module.exports = {
	prettyReport,
};
