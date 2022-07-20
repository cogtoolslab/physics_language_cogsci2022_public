/**
 * Summary: The major function to setup the experiment UI.
 *
 * Description: This function sets up the user interface of the experiment through the following major steps:
 *              (1) read JSON file that contains all permutations of experiment parameters (Env * )
 *
 */

function setupGame() {
    // read in 144 permutations of experiment parameters
    var stims = JSON.parse(data);


    /* create timeline */
    var seq = [];

    // create number of total trials
    var n_balls = 3;
    var n_trials = 24;
    var n_context = 2;
    var n_other_trials = 5; // consent, colorblind check, survey
    var n_total_trials = n_balls*n_trials*n_context+n_other_trials;

    // set up experiment design variables 
    var corr = [1,2,3];
    var ball_corr = jsPsych.randomization.repeat(corr, 1);
    var scenes = ['in-out-out-in', 'out-in-in-out'];
    var scene_shuffle = jsPsych.randomization.repeat(scenes,1);
    var held_outs = ["in-1", "in-2", "in-3", "out-1", "out-2", "out-3"]
    var held_out = jsPsych.randomization.repeat(held_outs,1);


    var correct_trials = 0; // current number of correct trials

    // at end of each trial save data locally and send data to server
    var final_on_finish = function(data) {
      // at the end of each trial, update the progress bar
      // based on the current value and the proportion to update for each trial
      var curr_progress_bar_value = jsPsych.getProgressBarCompleted();
      jsPsych.setProgressBar(curr_progress_bar_value + (1/n_total_trials));
    }

    var instructionsHTML = {
      'str1': ["<p> Here's how this game is going to work!\
       Each round, you'll be moving a red paddle around a circle to catch a ball. </p> \
      <div><img src='image/example.gif' width='900'></div> \
      <p>The ball will start out flying in the direction of the arrow, \
      but watch out because its flight path may change. </p>\
      <p> To play, first you'll use the &#8592 and &#8594 keys to move the paddle into position. \
      Then you'll press the <code>space</code>bar to launch the ball. \
      Note that once the ball is launched, you cannot move the paddle anymore.</p> \
      <p> Here are some hints to help you do your best: </p>\
      <p> Hint #1: Below are the three balls that will appear in the game. They may not behave \
      in the same way, so do pay attention to \
      which ball is being launched! </p>\
      <div><img src='image/example_1.png' width='100' height='100'>\
      </img><img src='image/example_2.png' width='100' height='100'>\
      </img><img src='image/example_3.png' width='100' height='100'></img></div> \
      <p> Hint #2: Below are the two different rooms you will be playing in, and \
      the balls may behave differently in each room, so pay attention to which room you are currently in! </p> \
      <div><img src='image/indoor_image.jpg' height='200'>\
      </img><img src='image/outdoor_image.jpg' height='200'></img></div> \
      <p> Hint #3: The length and color of the arrow tell you how hard the ball is being launched.</p>\
      <div><img src='image/arrow_big.png' height='200'>\
      </img><img src='image/arrow_small.png' height='100'></img></div> \
      <p>That's it! Click 'Next' when you're ready to begin. </p>"]
    };

    // add consent pages
    consentHTML = {
      'str1': ["<u><p id='legal'>Welcome!</p></u>",
      "<p id='legal'>In this experiment, you will play a game of virtual catch!</p><p> We expect this study to take approximately 30 to 40 minutes to complete, \
      including the time it takes to read these instructions.</p>"
      ].join(' '),
      'str2': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p id='legal'>By completing this study, you are participating in a \
      study being performed by cognitive scientists in the UC San Diego \
      Department of Psychology. The purpose of this research is to find out\
      how people understand their physical environment and communicate about their understandings. \
      You must be at least 18 years old to participate. There are neither\
      specific benefits nor anticipated risks associated with participation\
      in this study. Your participation in this study is completely voluntary\
      and you can withdraw at any time by simply exiting the study. You may \
      decline to answer any or all of the following questions. Choosing not \
      to participate or withdrawing will result in no penalty. Your anonymity \
      is assured; the researchers who have requested your participation will \
      not receive any personal information about you, and any information you \
      provide will not be shared in association with any personally identifying \
      information.</p><p> If you have questions about this research, please contact the \
      researchers by sending an email to \
      <b><a href='mailto://cogtoolslab.requester@gmail.com'>cogtoolslab.requester@gmail.com</a></b>. \
      These researchers will do their best to communicate with you in a timely, \
      professional, and courteous manner. If you have questions regarding your \
      rights as a research subject, or if problems arise which you do not feel \
      you can discuss with the researchers, please contact the UC San Diego \
      Institutional Review Board.</p><p>Click 'Next' to continue \
      participating in this study.</p>"
      ].join(' '),
      'str4': '<p>If you encounter a problem or error, send us an email \
      (cogtoolslab.requester@gmail.com) and we will make sure you are compensated \
      for your time! Please pay attention and do your best! Thank you!</p><p> Note: \
        We recommend using Safari or Chrome. We have not tested this study in other browsers. Please keep your browser maximized while playing this game.</p>'
    };

    //combine instructions and consent
    var introMsg = {
      type: 'instructions',
      pages: [
        consentHTML.str1,
        consentHTML.str2,
        instructionsHTML.str1,
        consentHTML.str4,
      ],

      show_clickable_nav: true,
      allow_backward: true,
      delay: false,
      delayTime: 2000,
    };
    seq.push(introMsg);

    var feedback = {
      type: 'feedback',
      stimulus: function(){
          return "<p style='font-size:30px;'>Press space to continue to the next trial.</p>";
      },
      choices: [' '],
      finishedTrials: function (){
          return (jsPsych.data.get().last(1).values()[0].trialInd + 1);
      },
      curr_correct_trials: function (){
          var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
          correct_trials += (last_trial_correct ? 1: 0);
          return correct_trials;
      },
      on_finish: function() {
        // at the end of each trial, update the progress bar
        // based on the current value and the proportion to update for each trial
        var curr_progress_bar_value = jsPsych.getProgressBarCompleted();
        jsPsych.setProgressBar(curr_progress_bar_value + (1/n_total_trials));
      }
    };

    // function for parsing json into structured experiment building blocks
    // two environments & three balls = 6 cells total, each cell has 24 trials
    // Description: return an array which represents a cell of experiment trials;
    // a cell would have n trials, where all trials in the cell has the same environment and ball
    // all trials in the cell are the same type: train/test trial
    // Parameter  :                          Description:
    //            numberTrialsPerCell - int               number of trials in a cell
    //                              e - int               e = 1 (indoor), e = 2 (outdoor)
    //                              b - int               b = 1, 2, 3 (different color/mass)
    function buildCell(numTrialsPerCell, e, b){
      var cell = []; // initialize cell array
      // loop thru parsed json data to find correct param combos
      for (i = 0; i < stims.length; i ++){
        // filter environment and type of ball
        if (stims[i].Es == e && stims[i].balls == b){
          if (cell.length < numTrialsPerCell){
            if (e == 1){ // indoor
              var trial = {
                type: 'intuitive-physics',
                scene: 'indoor',
                prompt: 'Use the left & right arrow key to move the paddle. When you are ready, press the spacebar to launch the ball.',
                gravity: {x: 0, y: -10},
                wind: {x: 50, y: 0},
                rho: stims[i].rhos,
                force: stims[i].Fs,
                theta: 0,
                ball: stims[i].balls,
                ball_corr: ball_corr,
                scene_shuffle: scene_shuffle[0],
                held_out: held_out[0],
                totalTrials: n_balls*n_trials*n_context
              };
              cell.push(trial);
            } else{ // outdoor
              var trial = {
                type: 'intuitive-physics',
                scene: 'outdoor',
                prompt: 'Use the left & right arrow key to move the paddle. When you are ready, press the spacebar to launch the ball.',
                gravity: {x: 0, y: -10},
                wind: {x: 50, y: 0},
                rho: stims[i].rhos,
                force: stims[i].Fs,
                theta: 0,
                ball: stims[i].balls,
                ball_corr: ball_corr,
                scene_shuffle: scene_shuffle[0],
                held_out: held_out[0],
                totalTrials: n_balls*n_trials*n_context
              };
              cell.push(trial);
            }
          }
        }
      }
      return cell;
    }

    // building cells
    var E1b1 = buildCell(n_trials, 1, 1);
    var E1b2 = buildCell(n_trials, 1, 2);
    var E1b3 = buildCell(n_trials, 1, 3);
    var E2b1 = buildCell(n_trials, 2, 1);
    var E2b2 = buildCell(n_trials, 2, 2);
    var E2b3 = buildCell(n_trials, 2, 3); // test cell

    if (held_out[0] == "out-2"){
      var E1_train = _.concat(E1b1, E1b2, E1b3);
      var E2_train = _.concat(E2b1, E2b3);
      var E2b_held_shuffled = _.shuffle(E2b2); // shuffle test blocks
    }
    else if (held_out[0]== "out-1"){
      var E1_train = _.concat(E1b1, E1b2, E1b3);
      var E2_train = _.concat(E2b2, E2b3);
      var E2b_held_shuffled = _.shuffle(E2b1); // shuffle test blocks
    }
    else if (held_out[0] == "out-3"){
      var E1_train = _.concat(E1b1, E1b2, E1b3);
      var E2_train = _.concat(E2b2, E2b1);
      var E2b_held_shuffled = _.shuffle(E2b3); // shuffle test blocks
    }
    else if (held_out[0] == "in-1"){
      var E1_train = _.concat(E1b2, E1b3);
      var E2_train = _.concat(E2b1, E2b2, E2b3);
      var E2b_held_shuffled = _.shuffle(E1b1); // shuffle test blocks
    }
    else if (held_out[0] == "in-2"){
      var E1_train = _.concat(E1b1, E1b3);
      var E2_train = _.concat(E2b1, E2b2, E2b3);
      var E2b_held_shuffled = _.shuffle(E1b2); // shuffle test blocks
    }
    else if (held_out[0] == "in-3"){
      var E1_train = _.concat(E1b1, E1b2);
      var E2_train = _.concat(E2b1, E2b2, E2b3);
      var E2b_held_shuffled = _.shuffle(E1b3); // shuffle test blocks
    }


    var E1_train_shuffled = _.shuffle(E1_train);
    var E2_train_shuffled = _.shuffle(E2_train);


    // build timeline
    // build the first E1 block
    var E1_first = [];
    for (i = 0; i < E1_train_shuffled.length/2; i++){
      E1_first = E1_first.concat(E1_train_shuffled[i]);
    }

    // build the first E2 block
    var E2_first = [];
    for (i = 0; i < E2_train_shuffled.length/2; i++){
      E2_first = E2_first.concat(E2_train_shuffled[i]);
    }

    // build the second E2 block
    var E2_second = [];
    for (i = E2_train_shuffled.length/2; i < E2_train_shuffled.length; i++){
      E2_second = E2_second.concat(E2_train_shuffled[i]);
    }

    // build the second E1 block
    var E1_second = [];
    for (i = E1_train_shuffled.length/2; i < E1_train_shuffled.length; i++){
      E1_second = E1_second.concat(E1_train_shuffled[i]);
    }

    // build timeline
    // concat all building blocks
    var train_test = [];
    if (scene_shuffle[0] == 'in-out-out-in'){
      train_test = train_test.concat(E1_first, E2_first, E2_second, E1_second, E2b_held_shuffled);
    }
    else if (scene_shuffle[0] == 'out-in-in-out'){
      train_test = train_test.concat(E2_first, E1_first, E1_second, E2_second, E2b_held_shuffled);
    }


    // assign new index to each trial
    for (i = 0; i < train_test.length; i ++){
      train_test[i].trialInd = i;
    }

    // add feedback to each trial
    for (i = 1; i <= train_test.length; i +=2) {
      train_test.splice(i, 0, feedback);
    }

    seq = _.concat(seq, train_test);
    
    // survey  
    // html elements for survey questions
    // image of three balls
    var img_html = '<p><div><img src="image/example_1.png" width="100" height="100"></img><img src="image/example_2.png" width="100" height="100"></img><img src="image/example_3.png" width="100" height="100"></img></div></p>';

    // demographic questions
    // age
    var age_html = '<p> Age:&emsp;&emsp;&emsp;&emsp;&emsp;<input name="age" type="number" min=18 required/></p>';
    // age_html += '<datalist id="skip"><option value="Prefer Not to Say"></datalist></p>';
    // gender
    var gender_list = '<p><label for="gender">Gender:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</label>';
    gender_list += '<select id="gender" name="gender" required>';
    gender_list += '<option disabled selected></option>';
    gender_list += '<option value="Male">Male</option>';
    gender_list += '<option value="Female">Female</option>';
    gender_list += '<option value="Non-binary">Non-binary</option>';
    gender_list += '<option value="Prefer Not to Say">Prefer Not to Say</option></select></p>';
    // education level
    var edu_list = '<p><label for="edu">Education Level:&nbsp;&emsp;&emsp;</label>';
    edu_list += '<select id="edu" name="edu" required>';
    edu_list += '<option disabled selected></option>';
    edu_list += '<option value="high school">High School</option>';
    edu_list += '<option value="2-year college">2-Year College</option>';
    edu_list += '<option value="4-year college">4-Year College</option>';
    edu_list += '<option value="graduate school">Graduate School</option>';
    edu_list += '<option value="post graduate">Post Graduate</option>';
    edu_list += '<option value="Prefer Not to Say">Prefer Not to Say</option></select></p>';
    // number of physics classes taken
    var vg1_list = '<p><label for="vg1">Have you ever completed a physics class in school?&nbsp;&nbsp;</label>';
    vg1_list += '<select id="vg1" name="vg1" required>';
    vg1_list += '<option disabled selected></option>';
    vg1_list += '<option value="Yes">Yes</option>';
    vg1_list += '<option value="No">No</option>';
    vg1_list += '<option value="Unsure or Do not want to say">Unsure or Do not want to say</option></select></p>';

    // video game questions
    var vg2_list = '<p><label for="vg2">How much experience do you have playing video games similar to this one?&emsp;&emsp;&nbsp;</label>';
    vg2_list += '<select id="vg2" name="vg2" required>';
    vg2_list += '<option disabled selected></option>';
    vg2_list += '<option value="None at all">None at all</option>';
    vg2_list += '<option value="Some experience">Some experience</option>';
    vg2_list += '<option value="A lot of experience">A lot of experience</option>';
    vg2_list += '<option value="Do not want to say">Do not want to say</option></select></p>';


    // experiment survey questions
    // ask about lightest ball
    var lightest_mass_html = '<div>Which ball has the lightest mass? </div>';
    lightest_mass_html += '<div><input type="radio" id="leftLightest" name="lightest mass" value="leftLightest"><label for="leftLightest" checked>left</label>';
    lightest_mass_html += '&emsp;<input type="radio" id="middleLightest" name="lightest mass" value="middleLightest"><label for="middleLightest" checked>middle</label>';
    lightest_mass_html += '&emsp;<input type="radio" id="rightLightest" name="lightest mass" value="rightLightest"><label for="rightLightest" checked>right</label></div><p></p> ';
    // ask about the medium-mass ball
    var medium_mass_html = '<div>Which ball has the medium mass? </div>';
    medium_mass_html += '<div><input type="radio" id="leftMedium" name="medium mass" value="leftMedium"><label for="leftMedium" checked>left</label>';
    medium_mass_html += '&emsp;<input type="radio" id="middleMedium" name="medium mass" value="middleMedium"><label for="middleMedium" checked>middle</label>';
    medium_mass_html += '&emsp;<input type="radio" id="rightMedium" name="medium mass" value="rightMedium"><label for="rightMedium" checked>right</label></div><p></p> ';
    // ask about the heaviest mass ball
    var heaviest_mass_html = '<div>Which ball has the heaviest mass? </div>';
    heaviest_mass_html += '<div><input type="radio" id="leftHeaviest" name="heaviest mass" value="leftHeaviest"><label for="leftHeaviest" checked>left</label>';
    heaviest_mass_html += '&emsp;<input type="radio" id="middleHeaviest" name="heaviest mass" value="middleHeaviest"><label for="middleHeaviest" checked>middle</label>';
    heaviest_mass_html += '&emsp;<input type="radio" id="rightHeaviest" name="heaviest mass" value="rightHeaviest"><label for="rightHeaviest" checked>right</label></div><p></p>';

    // question about strategies used
    var pedagogical_html = '<p>Great job! Other people who played this game found it quite challenging to catch the ball at first, but got better at it over time. We are interested in learning more about your experience playing this game. <b>Imagine someone who has never played this game before but is interested in learning how to play. What would you tell them so that they understand where to put the paddle on any given trial?</b> Please write a short paragraph that provides them with the most important information to help them succeed. </p>';
    pedagogical_html += '<p><textarea id="pedagogical" name="pedagogical" rows="10" cols="80" style="font-size: 15pt; font-style: serif;" required></textarea></p>';

    var baseline_html = '<p>Great job! Other people who played this game were reminded of other video games that looked and felt similar to this one. We are interested in learning more about your experience playing this game. <b>Imagine someone who has never played this game before but is interested in picking it up at the store. What would you tell them so that they could identify it based on a few screenshots?</b> Please write a short paragraph that provides them with the most important information to help them pick out this game from a lineup of other similar-looking ones. </p>';
    baseline_html += '<p><textarea id="baseline" name="baseline" rows="10" cols="80" style="font-size: 15pt; font-style: serif;" required></textarea></p>';

    var baseline_survey = {
      type: 'survey-html-form',
      preamble: '<p><div><img src="image/shrug.png" width="100"></img></div></p>',
      html: baseline_html,
      name: 'baseline',
      on_finish: final_on_finish
      };


    var pedagogical_survey = {
      type: 'survey-html-form',
      preamble: '<p><div><img src="image/shrug.png" width="100"></img></div></p>',
      html: pedagogical_html,
      name: 'pedagogy',
      on_finish: final_on_finish
      };
    seq.push(pedagogical_survey);
    seq.push(baseline_survey);

    // set up page for experiment related survey
    var strategy_survey = {
      type: 'survey',
      preamble: '<p> Please answer the following questions about experiment: </p>' + img_html,
      html:  lightest_mass_html + medium_mass_html + heaviest_mass_html,
      on_finish: final_on_finish
      };
      seq.push(strategy_survey);

    // set up page for demographic survey
    var demographic_survey = {
      type: 'survey',
      preamble: '<p> Thank you for your response, please answer the following demographic questions: </p>',
      html:  age_html + gender_list + edu_list + vg1_list + vg2_list,
      on_finish: final_on_finish
      };
      seq.push(demographic_survey);

  
    var goodbye_trial = {
      type: 'instructions',
      pages: [
        "<p>Congrats! You are all done. Thanks for participating in our game!</p> \
        <p>Click 'Next' to submit this study to Prolific. After you click 'Next', you will see a blank page on this web page \
        but will be redirected to the Prolific homepage. \
        This means that your participation has been logged. \
        If you do not receive credit after immediately, please wait a few days.</p>"
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
    };
    seq.push(goodbye_trial);

    jsPsych.init({
      timeline: seq,
      show_progress_bar: true,
      auto_update_progress_bar: false
    });
} // close setup game