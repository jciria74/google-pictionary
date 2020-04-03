$(function() {
  /* No mobile browser support */

  if (/Mobi/.test(navigator.userAgent)) {
    $('.no-mobile').css('display', 'block');
    $('content-container').css('display', 'none');
    $('button').css('display', 'none');
    $('.ok-button').css('display', 'none');
  }

  showText("#message1", "You have 20 seconds to draw something. An A.I. from Google will be guessing what you draw. You can see on the bottom right part of the screen what the A.I. is thinking. You will start with the easy difficulty level, always try to draw simple and large pictures", 0, 40);

  $('.ok-button').on('click', function(){
    $('.overlay').css('display', 'none');
    timer(playSeconds);
  });

  $(document).on('keypress', function(e){
    if (e.keyCode === 13) {
      $('.overlay').css('display', 'none');
      timer(playSeconds);
    }
  });

  $('.retry-button').on('click', function() {
    $('.gameover').css('display', 'none');
    location.reload();
  });

  $('#picture').html(drawableItem);
});

var difficulty = 'easy';

var levelPics = {
  easy: ['tree', 'door', 'sunglasses', 'clock', 'skateboard', 'triangle', 'envelope', 'house', 'basketball', 'lollipop', 'paper clip', 'sun', 'spoon'],
  medium: ['crown', 'hospital', 'bat', 'helicopter', 'laptop', 'penguin', 'shorts', 'parachute', 'bed', 'cactus', 'car', 'lantern', 'owl', 'skull', 'jail', 'campfire', 'hamburger'],
  hard: ['aircraft carrier', 'animal migration', 'sea turtle', 'the mona lisa', 'hot tub', 'kangaroo', 'bulldozer', 'the great wall of china', 'the eiffel tower', 'dragon', 'trombone', 'sink', 'school bus']
};

var drawableItem = drawingRandomizer(difficulty, levelPics);
var points = 0;
var successaudio = document.getElementById("audio-effect");
var ingame = document.getElementById("audio-ingame");
var victory = document.getElementById("audio-victory");
var playSeconds = 21;
var countdown;

var postDrawing =

  function() { $.ajax({
    type: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    url: 'https://inputtools.google.com/request?ime=handwriting&app=quickdraw&dbg=1&cs=1&oe=UTF-8',
    data: JSON.stringify({
      "options": "enable_pre_space",
      "requests": [{
        "writing_guide": {
          "writing_area_width": canvas.width,
          "writing_area_height": canvas.height
        },
        "ink": trace,
        "language":"quickdraw"
      }
      ]
    }),
    success: function(data, status) {
      var resultCrude = data[1][0][1][0];
      var result = resultCrude.toLowerCase();
      if (result === drawableItem) {
        $('canvas').css('user-select', 'none');
        points += 1;
        if(points >= 15) {
          $('.victory').css('display', 'block');
          showGoogleGuess(result, 'success');
          ingame.pause();
          clearInterval(countdown);

        } else {
          $('#pointstext').html('Points: ' + points);
          toggleSuccess();
          showGoogleGuess(result, 'success');
          getDifficulty();
          displayNextItem();
          timer(playSeconds);
          $('canvas').css('user-select', 'all');
        }
      } else {
        showGoogleGuess(result, 'nosuccess');
      }
    },
    error: function(data, status) {
      console.log('Error: ' + JSON.stringify(data));
    }
    });
  };

function drawingRandomizer(difficulty, pictures) {

  if (difficulty === 'easy') {
    return randomArrayItem(pictures.easy);
  } else  if (difficulty === 'medium') {
    return randomArrayItem(pictures.medium);
  } else if (difficulty === 'hard') {
    return randomArrayItem(pictures.hard);
  } else {
    return 'No difficulty level given!';
  }
}

function randomArrayItem(arr) {
  var index = Math.floor(Math.random() * arr.length);
  var item = arr[index];
  arr.splice(index, 1);
  return item;
}

function toggleSuccess() {
  $('.point-container').addClass('success');
  setTimeout( function(){
    $('.point-container').removeClass('success');
  }, 500);
}

function displayNextItem() {
  setTimeout(function(){
    clearCanvas();
    drawableItem = drawingRandomizer(difficulty, levelPics);
    $('#picture').html(drawableItem);
  }, 700);
}

function getDifficulty() {
  if (points >= 11) {
    difficulty = 'hard';
  } else if (points >= 6) {
    difficulty = 'medium';
  } else if (points === undefined) {
    difficulty = 'easy';
  } else {
    difficulty = 'easy';
  }

  $('#difficultytext').html('Difficulty: ' + difficulty);

}

function showGoogleGuess(item, success) {

  var color = success === 'success' ? 'green' : 'blue';

  iziToast.show({
    color: color,
    position: 'bottomRight',
    timeout: '1700',
    pauseOnHover: false,
    title: 'Google thinks you are drawing this: ',
    message: item
});
}

var showText = function (target, message, index, interval) {
  if (index < message.length) {
    $(target).append(message[index++]);
    setTimeout(function () { showText(target, message, index, interval); }, interval);
  }
};

var timerDisplay = document.querySelector('.countdown');

function timer(seconds) {

  clearInterval(countdown);
  var counter = seconds;

  countdown = setInterval(function(){
    counter--;
    if(counter < 0) {
      clearInterval(countdown);
      gameOver();
    }
    timerDisplay.textContent = 'Seconds left: ' + counter;
  }, 1000);
}


function gameOver() {
  $('.gameover').css('display', 'block');
  $('#pointsscored').html('You got: ' + points + (points === 1 ? ' point.' : ' points.'));
}
