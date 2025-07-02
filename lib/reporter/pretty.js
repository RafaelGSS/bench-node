const { styleText } = require("../utils/styleText");
const { timer } = require("../clock");
const os = require("node:os");

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

	const baselineResult = results.find((result) => result.baseline);
	const hasBaseline = baselineResult !== undefined;
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

		const sortedResults = [...results].sort((a, b) => {
			if (a.baseline) return -1;
			if (b.baseline) return 1;
			return (a.opsSec || 0) - (b.opsSec || 0);
		});

		const maxNameLength = Math.max(...sortedResults.map((r) => r.name.length));

		for (const result of sortedResults) {
			const namePart = `  ${result.name}`;
			process.stdout.write(namePart);

			const padding = maxNameLength - result.name.length + 2;
			process.stdout.write(" ".repeat(padding));

			if (result.baseline) {
				process.stdout.write(styleText("magenta", "(baseline)"));
			} else if (
				baselineResult.opsSec !== undefined &&
				result.opsSec !== undefined
			) {
				const baselineHz = baselineResult.opsSec;
				const benchmarkHz = result.opsSec;
				let comparisonText;

				if (benchmarkHz > baselineHz) {
					const timesFaster = (benchmarkHz / baselineHz).toFixed(2);
					comparisonText = styleText("green", `(${timesFaster}x faster)`);
				} else {
					const timesSlower = (baselineHz / benchmarkHz).toFixed(2);
					comparisonText = styleText("red", `(${timesSlower}x slower)`);
				}
				process.stdout.write(comparisonText);
			}
			process.stdout.write("\n");
		}
	}

	process.stdout.write("\n");
}

function buildTree(results) {
	const tree = { children: new Map() };

	for (const result of results) {
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

	const color = "cyan";

	if (result.opsSec !== undefined) {
		const opsSecReported =
			result.opsSec < 100 ? result.opsSec.toFixed(2) : result.opsSec.toFixed(0);
		process.stdout.write(
			styleText([color, "bold"], `${formatter.format(opsSecReported)} ops/sec`),
		);
	} else if (result.totalTime !== undefined) {
		let timeFormatted;
		if (result.totalTime < 0.000001) {
			timeFormatted = `${(result.totalTime * 1000000000).toFixed(2)} ns`;
		} else if (result.totalTime < 0.001) {
			timeFormatted = `${(result.totalTime * 1000000).toFixed(2)} µs`;
		} else if (result.totalTime < 1) {
			timeFormatted = `${(result.totalTime * 1000).toFixed(2)} ms`;
		} else {
			timeFormatted = `${result.totalTime.toFixed(2)} s`;
		}
		process.stdout.write(
			styleText([color, "bold"], `${timeFormatted} total time`),
		);
	}

	const samples = result.samples || result.histogram?.samples;
	process.stdout.write(` (${samples} runs sampled) `);

	if (result.histogram) {
		process.stdout.write("min..max=(");
		process.stdout.write(
			styleText("green", timer.format(result.histogram.min)),
		);
		process.stdout.write(styleText("dim", "..."));
		process.stdout.write(
			styleText("red", `${timer.format(result.histogram.max)})`),
		);
	}
}

module.exports = {
	prettyReport,
};
