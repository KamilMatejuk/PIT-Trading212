function update_colors(event) {
    let dark = false
    if (event) {
        dark = event.target.checked
    }
    const root = document.querySelector(':root');
    const logo_dark_blue_bg = '#343b44'
    const logo_text = '#fdfdfd'
    const logo_blue_tick = '#00a3e3'
    if (dark) {
        root.style.setProperty('--red', '#ff5e5e');
        root.style.setProperty('--green', '#36D436');
        root.style.setProperty('--bg-color', logo_dark_blue_bg);
        root.style.setProperty('--text-color', logo_text);
        root.style.setProperty('--accent-color', logo_blue_tick);
    } else {
        root.style.setProperty('--red', '#f72835');
        root.style.setProperty('--green', '#289c28');
        root.style.setProperty('--bg-color', logo_text);
        root.style.setProperty('--text-color', logo_dark_blue_bg);
        root.style.setProperty('--accent-color', logo_blue_tick);
    }
    // charts
    if (Chart) {
        for (var key in Chart.instances) {
            Chart.instances[key].options.scales.xAxis.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
            Chart.instances[key].options.scales.yAxis.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
            Chart.instances[key].update()
        }
}
    // images
    const images = document.querySelectorAll('section#faq img');
    for (i = 0; i < images.length; i++) {
        if (dark) {
            images[i].src = images[i].src.toString().replace('light', 'dark');
        } else {
            images[i].src = images[i].src.toString().replace('dark', 'light');
        }
    }
}
