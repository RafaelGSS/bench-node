const { format } = require("@fast-csv/format");

const { timer } = require("../clock");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

function csvReport(results) {
	const stream = format();
	stream.pipe(process.stdout);

	process.stdout.write("name,ops/sec,samples,plugins,min,max\n");

	for (const result of results) {
		const opsSecReported =
			result.opsSec < 100 ? result.opsSec.toFixed(2) : result.opsSec.toFixed(0);

		process.stdout.write(`${result.name},`);

		process.stdout.write(`"${formatter.format(opsSecReported)}",`);

		process.stdout.write(`${result.histogram.samples},`);

		process.stdout.write(
			`"${result.plugins
				.filter((p) => p.report)
				.map((p) => p.report)
				.join(",")}",`,
		);

		process.stdout.write(`${timer.format(result.histogram.min)},`);

		process.stdout.write(`${timer.format(result.histogram.max)}\n`);
	}
}

module.exports = {
	csvReport,
};
