function signup() {
  $('#left_signup').css('background-color','#aaa') ;
  $('#left_signup').css('color', 'white') ;

  $('#left_login').css('background-color', '#fff') ;
  $('#left_login').css('color', 'black') ;

  $('#login_form').css('display', 'none') ;
  $('#signup_form').css('display', 'block') ;

  $('#signup_form_email_id').text("") ;
  $('#signup_form_password').text("") ;
  $('#signup_form_username').text("") ;
}

function login_clicked() {
  $('#left_signup').css('background-color','#fff') ;
  $('#left_signup').css('color', 'black') ;

  $('#left_login').css('background-color', '#aaa') ;
  $('#left_login').css('color', 'white') ;

  $('#login_form').css('display', 'block');
  $('#signup_form').css('display', 'none') ;

  $('#login_form_email_id').text("") ;
  $('#login_form_password').text("") ;
}

function showLoginSignup() {
  //$('#login_signup_form').css('display', 'block') ;
  console.log('type of user is '+logged_in_user);
  if(!logged_in_user) {
    $('#login_signup_form_modal').fadeToggle(300) ;
    $('#login_signup_form').slideToggle(500) ;
  }
  else {
    $('#logged_in_user_options, #loggedin_user_option').slideToggle(500) ;
  }

}

function clearLoginSignup() {
  document.getElementById('signup_form_username').value = "";
  document.getElementById('signup_form_password').value = "" ;
  document.getElementById('signup_form_email_id').value = "" ;
  document.getElementById('login_form_email_id').value  = "" ;
  document.getElementById('login_form_password').value = "" ;
}

function showMainLoader() {
  var loader = document.getElementById('loader_modal') ;
  loader.style.display = "block" ;
  var loader_content = document.getElementById('main_loader') ;
  loader_content.style.display = "block" ;
}
function hideMainLoader() {
  var loader = document.getElementById('loader_modal') ;
  loader.style.display = "none" ;
  var loader_content = document.getElementById('main_loader') ;
  loader_content.style.display = "none" ;
}

function showLoaderWithinAnElement(element_id) {
  var loader = $('<div id="elementLoader"><div id="loader_element_1" class="elementLoader"></div><div id="loader_element_2" class="elementLoader"></div><div id="loader_element_3" class="elementLoader"></div><div id="loader_element_4" class="elementLoader"></div><div id="loader_element_5" class="elementLoader"></div></div>') ;
  var element = $("#"+element_id);
  loader.css('display', 'block') ;
  loader.css('position', 'relative') ;
  loader.css('top', '40%') ;
  loader.css('left', '50%') ;

  let loaderWidth = element.width()/10 ;
  let loaderHeight = element.height()/10 ;

  loader.css('width', loaderWidth+'px') ;
  loader.css('margin-left', '-'+(parseInt(loaderWidth/2))+'px') ;

  let spacewidth = loaderWidth /7 ;
  let spaceheight = loaderHeight/2 ;

  element.append(loader) ;

  var loaderelement = $('#fountainG') ;
  $('elementLoader').css('width', spacewidth+'px') ;
  $('elementLoader').css('height', spaceheight+'px') ;

  $('#loader_element_1').css('left', '0px') ;
  $('#loader_element_2').css('left', 2*spacewidth+'px') ;
  $('#loader_element_3').css('left', 4*spacewidth+'px') ;
  $('#loader_element_4').css('left', 6*spacewidth+'px') ;
  $('#loader_element_5').css('left', 8*spacewidth+'px') ;

}
function hideLoaderWithinAnElement(element_id) {
  var element_loader = $('#'+element_id+' #elementLoader') ;
  element_loader.hide(500) ;
}


function showNotification(data, color) {
  var notification = document.getElementsByClassName('notification')[0] ;
  var notification_content = document.getElementsByClassName('notification_content')[0] ;
  notification_content.innerHTML = data ;
  notification_content.style.color = color ;
  notification.style.display = "block" ;
}

function showAddButton(data) {
  if(data!="No user detail found. Please signup to continue.") {
    $('#addbutton').css('display','block') ;
  }
}

function register() {
  var object = {} ;
  showLoginSignup() ;
  object.username = document.getElementById('signup_form_username').value ;
  object.password = document.getElementById('signup_form_password').value ;
  object._id = document.getElementById('signup_form_email_id').value ;
  showMainLoader() ;

  $.ajax({
    url: "users/create" ,
    type: 'POST' ,
    contentType: "application/json",
    data: JSON.stringify(object) ,
    success: function(data) {
      // the user has been created
      $('#addbutton').css('display','block') ;
      $('#login_signup_form').slideToggle(500) ;
      showNotification(data, "green") ;
      clearLoginSignup() ;
      hideMainLoader() ;
    },
    error: function(data) {
      // the user cannot be created
      $('#login_signup_form').slideToggle(500) ;
      showNotification(data.responseText, "red") ;
      hideMainLoader() ;
    }
  })
}

function login() {
  showLoginSignup() ;
  var object = {} ;
  object._id = document.getElementById('login_form_email_id').value ;
  object.password = document.getElementById('login_form_password').value ;
  showMainLoader() ;

  $.ajax({
    url: "users/login",
    type: "POST",
    contentType: "application/json" ,
    data: JSON.stringify(object),
    success: function(data) {
      // the user has successfully logged in
      showAddButton(data) ;
      clearLoginSignup() ;
      hideMainLoader() ;
      logged_in_user = true ;
    },
    error: function(data) {
      // the user cannot login
      $('#login_signup_form').slideToggle(500) ;
      showNotification(data.responseText, "red") ;
      clearLoginSignup() ;
      hideMainLoader() ;
    }
  })
}

function logout() {
  showLoginSignup() ;
  showMainLoader() ;
  $.ajax({
    url: "users/logout",
    method : "GET",
    success: function() {
      // successfully logged out.
      hideMainLoader() ;
      location.reload() ;
    },
    error : function() {
      // some error occured
    }
  })
}

function google_auth() {
  $.ajax({
    url: '/auth_google',
    method: 'GET',
    success: function() {
      console.log("success");
    }
  })
}
