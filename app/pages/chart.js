import Chart from 'chart.js'

function render () {
  document.querySelectorAll('.chartjs').forEach(element => {
    try {
      // eslint-disable-next-line no-new
      new Chart(element, JSON.parse(element.textContent))
    } catch (e) {
      element.outerHTML = `<pre>Chart.js complains: "${e}"</pre>`
    }
  })
}

export default {
  render
}
