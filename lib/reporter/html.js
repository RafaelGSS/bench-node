const fs = require('node:fs');
const path = require('node:path');

const formatter = Intl.NumberFormat(undefined, {
  notation: 'standard',
  maximumFractionDigits: 2,
});

const opsToDuration = (maxOps, ops, scalingFactor = 10) => {
  const baseSpeed = (maxOps / ops) * scalingFactor;
  return Math.max(baseSpeed, 2); // Normalize speed with a minimum of 2 seconds
};

const generateHTML = (template, durations) => {
  let css = ''
  let circleDiv = ''
  let labelDiv = ''
  let position = 20;
  const colors = ['red', 'blue', 'green', 'pink', 'grey', 'purple']
  for (const d of durations) {
    css += `
      #label-${d.name} {
        top: ${position}px;
      }

      #circle-${d.name} {
        background-color: ${colors.shift()};
        top: ${position}px;
      }
    `
    circleDiv += `
      <div id="label-${d.name}" class="label">${d.name}

      (${d.opsSecFormatted} ops/sec)</div>
    `
    labelDiv += `
      <div id="circle-${d.name}" class="circle"></div>
    `

    position += 80;
  }

  return template
    .replaceAll('{{DURATIONS}}', JSON.stringify(durations))
    .replaceAll('{{CSS}}', css)
    .replaceAll('{{LABEL_DIV}}', labelDiv)
    .replaceAll('{{CIRCLE_DIV}}', circleDiv)
    .replaceAll('{{CONTAINER_HEIGHT}}', `${durations.length * 100}px;`);
};

const templatePath = path.join(__dirname, 'template.html');
const template = fs.readFileSync(templatePath, 'utf8');

function htmlReport(results) {
  const maxOpsSec = Math.max(...results.map(b => b.opsSec));

  const durations = results.map((r) => ({
    name: r.name.replaceAll(' ', '-'),
    duration: opsToDuration(maxOpsSec, r.opsSec),
    opsSecFormatted: formatter.format(r.opsSec)
  }));

  const htmlContent = generateHTML(template, durations);
  fs.writeFileSync('result.html', htmlContent, 'utf8');
  process.stdout.write('HTML file has been generated: result.html');
}


module.exports = {
  htmlReport,
}

