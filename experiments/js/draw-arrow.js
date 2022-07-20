function init() {
    const arrow_headlen = 5;
    var trial_theta = 0;
    var trial_force = 60;
    var trial_rho = 2.5;
    var arrow_color;

    if (trial_force == 60.0){
      arrow_color = "#ffad33";
    } else {
      arrow_color = "#ff0000";
    }

    const canvas = document.getElementById('b2dCanvas');
    const ctx = canvas.getContext('2d');
    // get internal dimensions of the canvas
    const canvas_width = canvas.width;
    const canvas_height = canvas.height;
    const force = {x: trial_force*Math.cos(trial_rho+trial_theta), y: trial_force*Math.sin(trial_rho+trial_theta)};
    const start_position = {x: canvas_width*0.5+0.32*canvas_width * Math.cos(trial_rho), y: canvas_height*0.5+0.32*canvas_width * Math.sin(trial_rho)};

    fromx = start_position.x;
    fromy = start_position.y;
    tox = start_position.x-3*force.x;
    toy = start_position.y-3*force.y;
    // This makes it so the end of the arrow head is located at tox, toy, don't ask where 1.15 comes from
    let angle = Math.atan2(toy-fromy,tox-fromx);
    tox -= Math.cos(angle) * ((trial_force/5));     
    toy -= Math.sin(angle) * ((trial_force/5));
    
    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = arrow_color;
    ctx.lineWidth = trial_force/5;
    ctx.stroke();
    
    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-arrow_headlen*Math.cos(angle-Math.PI/7),toy-arrow_headlen*Math.sin(angle-Math.PI/7));
    
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-arrow_headlen*Math.cos(angle+Math.PI/7),toy-arrow_headlen*Math.sin(angle+Math.PI/7));
    
    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-arrow_headlen*Math.cos(angle-Math.PI/7),toy-arrow_headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = arrow_color;
    ctx.lineWidth = trial_force/5;
    ctx.stroke();
    ctx.fillStyle = arrow_color;
    ctx.fill();
  }
  
window.addEventListener("load",init);