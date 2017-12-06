let user_rating = "undefined" ;
let previous_rating = "undefined" ;
let sticky_id_modal = "undefined" ;
let logged_in_user = false ;
let originalProfilePictureString = "" ;
let newProfilePictureSameAsOld = false ;
let newProfilePictureString = "" ;

// used for handling the width of sticky_images on different devices.
let sticky_image_width = 250 ; // default for the desktop devices.

/**Makes a request to server to provide a list of all the available stickys*/
$('document').ready(function() {
  showMainLoader() ;
  // to find out if the user is authorized (previously he/she had logged in);
  console.log("finding out the type of user");
  $.ajax({
    url: "users/getUserType",
    method: "GET",
    dataType: "JSON",
    success: function(usertype) {
      console.log(usertype);
      if (usertype.usertype === "authorized") {
        logged_in_user = true ;
        console.log("user has previously logged in");
        showAddButton("Hello") ;
      }
      else {
        logged_in_user = false ;
        console.log("The user had not previoulsy logged in");
      }
    },
    error : function() {
      // suppose the user is unauthorized
      logged_in_user = false ;
      console.log("The user had not previously logged in");
    }
  })

  // call the method to generate list of stickys in the container.
  generateListOfStickyInTheContainerElement('.grid','grid-item',true ,'content', "all", false) ;

  // for the rating mechanism
  let $smilerating = $("#show_sticky .ratings .fa-smile-o") ;
  let $mehrating = $("#show_sticky .ratings .fa-meh-o") ;
  let $frownrating = $("#show_sticky .ratings .fa-frown-o") ;

  // for the smiley rating
  $smilerating.click(function() {
    user_rating = "smile" ;
    $(this).css("color", "green") ;
    $mehrating.css("color", "black") ;
    $frownrating.css("color", "black") ;
  });

  // for the meh rating
  $mehrating.click(function() {
    user_rating = "meh" ;
    $(this).css("color", "grey") ;
    $smilerating.css("color", "black") ;
    $frownrating.css("color", "black") ;
  });

  // for the frown ratings
  $frownrating.click(function() {
    user_rating = "frown" ;
    $(this).css("color", "red") ;
    $smilerating.css("color", "black") ;
    $mehrating.css("color", "black") ;
  });

  // if the logo is pressed, the homepage must be reloaded
  $('#title').click(function() {
    location.reload() ;
  })

  // reload the website if the window is resized
  let initialWidth = $(window).width() ;
  $(window).resize(function() {
    if($(window).width() != initialWidth) {
      location.reload() ;
    }
  })
})

function deleteThisSticky(sticky_id) {
  console.log("called to delete "+sticky_id);
  let object = {} ;
  object._id = sticky_id ;

  $.ajax({
    url: "data/delete_sticky",
    method : "POST",
    contentType: "application/json",
    data: JSON.stringify(object),
    success: function() {
      // the sticky has been successfully deleted. Simply reload the page.
      location.reload() ;
    }
  })
}

function generateListOfStickyInTheContainerElement(grid_selector,list_selector, fit_width, container_element_id , desired_sticky_id_s, deletebutton) {

  $(grid_selector).imagesLoaded( function() {
    console.log("images have been loaded");
    if($(document).width()>=600) {
      $(grid_selector).masonry({
        // options
        itemSelector: '.'+list_selector,
        columnWidth: 250,
        gutter: 10,
        horizontalOrder: true,
        fitWidth: fit_width,
        stagger: 30
      });
    }
    else {
      sticky_image_width = 150 ;
      $(grid_selector).masonry({
        // options
        itemSelector: '.'+list_selector,
        columnWidth: 150,
        gutter: 10,
        horizontalOrder: true ,
        fitWidth: fit_width,
        stagger: 30
      });
    }
  });

  // clearing the contents of the container
  if(desired_sticky_id_s === "all" || desired_sticky_id_s.length>0) {
    document.getElementById(container_element_id).innerHTML = "" ;
  }

  $.ajax({
    url: "/data/list_sticky",
    method: "GET",
    success: function(data) {
      // data contains the list of all available stickys
      for(let i = 0 ; i<data.length ; i++) {
        let sticky = data[i] ;
        hideMainLoader() ;
        if (desired_sticky_id_s === "all" || desired_sticky_id_s.indexOf(sticky._id)>-1) {
          //console.log(sticky);
          createNewStickyInTheContainerElement(grid_selector,list_selector,container_element_id,sticky.title, sticky.link_of_the_image, sticky.description, sticky._id, sticky.smile, sticky.meh, sticky.frown, deletebutton);
        }
      }
    },
    error: function() {
      // server could not send any data.
      hideMainLoader() ;
      showNotification("The server didn't send any data. Please reload the page.", "green");
    }
  });
}

/** function to be used during loading and during creation of new sticky. Used to create stickys in the homepage*/
function createNewStickyInTheContainerElement(grid_selector,list_selector, sticky_container_id,title, image, description, _id, smiles, meh, frowns, deletebutton) {
  var content = document.getElementById("''"+sticky_container_id+"''") ;
  console.log("sticky_image width is "+sticky_image_width);
  var deletebuttoncode = $("<i class='fa fa-trash sticky_delete_button_user_authorized' aria-hidden='true' style = 'color: red; font-size: 1.5em;cursor:pointer;position:absolute; top:50px;left:200px;background-color: #ddd; padding: 10px 12px; border-radius: 50%; z-index:2'></i>");

  var sticky =  $("<div class='"+list_selector+"'><div id='"+_id+"' onclick=getStickyDetails('"+_id+"') class='body_sticky'><div class = 'sticky_title'>"+title+"</div><div class = 'sticky_image'><img class='sticky_imag' src="+image+" width="+sticky_image_width+" /></div><div class='sticky_rating'><span class='ratings'><span id='smilevalue' class='ratingsvalue'>"+smiles+"</span><i title='"+smiles+" smiles' class='fa fa-smile-o' aria-hidden='true'></i><span id='mehvalue' class='ratingsvalue'>"+meh+"</span><i title='"+meh+" mehs' class='fa fa-meh-o' aria-hidden='true'></i><span id='frownvalue' class='ratingsvalue'>"+frowns+"</span><i title='"+frowns+" frowns' class='fa fa-frown-o' aria-hidden='true'></i></span></div><input class = 'description' type='hidden' value = '"+description+"'></input></div></div>");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// in the mobile version, the delete buttons will not be shown///////////////////////
  if(deletebutton && $(window).width()>600) {
    deletebuttoncode.attr('onclick', 'deleteThisSticky("'+_id+'")')
    sticky.append(deletebuttoncode);
  }

  $(grid_selector).append( sticky ).masonry( 'appended', sticky );
  $(grid_selector).imagesLoaded().progress( function() {
    $(grid_selector).masonry('layout');
  });
  //$('#content') .masonry( 'appended', elem ).masonry();
}


let dataobject = {} ;

function showStickyModal(id, title, image, description, urlOfProfilePicture, uploader_name, ratings) {
  if(logged_in_user) {
    if(urlOfProfilePicture ==="undefined") {
      urlOfProfilePicture = "public/images/user.png" ;
    }
    sticky_id_modal = id ;

    console.log("ratings is "+ratings);
    switch(ratings) {
      case "smile" :
        $("#show_sticky .ratings .fa-smile-o").css("color", "green") ;
        break ;
      case "meh" :
        $("#show_sticky .ratings .fa-meh-o").css("color", "grey") ;
        break ;
      case "frown" :
        $("#show_sticky .ratings .fa-frown-o").css("color", "red") ;
        break ;
    }

    $("#upper_navigation").css("display", "none") ;
    $("#Uploader_image_show_sticky #uploader_image").attr('src', urlOfProfilePicture) ;
    $("#sticky_image_show_sticky").attr('src', image) ;
    $("#uploader_name_show_sticky").text(uploader_name) ;
    $("#sticky_title_show_sticky").text(title) ;
    $("#sticky_description_show_sticky").text(description) ;

    $("#show_sticky_modal, #show_sticky").fadeIn(500) ;
    $("#content").fadeOut(200) ;
  }
  else {
    showLoginSignup() ;
  }
}

function hideStickyModal() {
  $("#show_sticky, #show_sticky_modal").fadeOut(500) ;
  $("#upper_navigation, #content").fadeIn(500) ;
}

function getStickyDetails(id) {
  console.log("id is "+id.toString());

  // check whether the user is logged in or not. It not loggedin, show the login form and ask for the user to login.

  showMainLoader() ;

  var title = $("#"+id+" .sticky_title").text();
  var image = $("#"+id+" .sticky_imag").attr("src") ;
  dataobject.id = id ;
  var description = $("#"+id+" .description").attr("value") ;

  var object = {} ;
  object.id = id ;
  console.log(object);
  $.ajax({
    url: "data/get_sticky_details",
    contentType : "application/json",
    data: JSON.stringify(object),
    method: 'POST',
    success: function(data) {
      // data must contain uploader_image, uploader_name, previous rating given by the current user
      console.log(data);
      dataobject.urlOfProfilePicture = data.urlOfProfilePicture ;
      var uploader_name = data.uploader_name  ;
      var ratings = data.ratings_by_this_user ;
      previous_rating = data.ratings_by_this_user ;

      showStickyModal(id, title, image, description, data.urlOfProfilePicture,uploader_name,ratings)  ;
      hideMainLoader() ;
    },
    error: function(data) {
      // data will contain the message communicated
      hideMainLoader() ;
    }
  })
}

// variable for the showing and hiding of the add sticky show dialog box
var show = false ;
/////// this function is for the add button show dialog.
function showDialog() {
  var addoptionsdialog = document.getElementById('add_options_dialog') ;
  if (show == false) {
    $('#addOptions_dialog_modal').fadeIn(300) ;
    $('#add_options_dialog').fadeIn(500) ;
    show = true ;
  }
  else {
    $('#add_options_dialog').fadeOut(500) ;
    $('#addOptions_dialog_modal').fadeOut(500) ;
    show = false ;
  }
}

/////// this function is called when the X is pressed in the add by website dialog box
var websitedialogbox = false ; // dialog box is hidden
function Show_close_Add_Using_Website_DialogBox() {
  var dialog = document.getElementById('add_Using_Website_DialogBox') ;
  if (websitedialogbox == false) {
    dialog.style.display = "block" ;
    $('#add_Using_Website_DialogBox_modal').fadeIn(200) ;
    websitedialogbox = true ;
    showDialog() ;
  }
  else {
    dialog.style.display = "none" ;
    $('#add_Using_Website_DialogBox_modal').fadeOut(200) ;
    websitedialogbox = false ;
  }
}

// during the submission of the rating for the given stickys
function submitUserReview() {
  let datavalue = {} ;
  datavalue.sticky_id = sticky_id_modal ;
  datavalue.previous_rating = previous_rating ;
  datavalue.new_rating = user_rating ;

  console.log("data sent to the server is "+JSON.stringify(datavalue));
  // the email_id of current_user is stored in the server for the current session.
  // the email_id of the uploader must be found out by the server for updating the uploader's profile about the no. of smiles he has received.
  showMainLoader() ;
  $.ajax({
    url: "data/submit_user_review_for_sticky",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(datavalue),

    success: function() {
      // the rating was successfull
      // increment the no. of smiles|meh|frowns for the stickys
      hideStickyModal() ;
      hideMainLoader() ;

      let item = $(".grid-item #"+sticky_id_modal+" #"+user_rating+"value")  ;
      let value = parseInt(item.text()) ;
      item.text(value+1) ;

      let $smilerating = $("#show_sticky .ratings .fa-smile-o") ;
      let $mehrating = $("#show_sticky .ratings .fa-meh-o") ;
      let $frownrating = $("#show_sticky .ratings .fa-frown-o") ;

      $smilerating.css('color', 'black') ;
      $mehrating.css('color', 'black') ;
      $frownrating.css('color', 'black') ;

      location.reload() ;
    },
    error : function() {
      hideMainLoader() ;
      showNotification("Please try again. ", "red") ;
    }
  })
}

// for initializing the dialog behaviour
function unauthorizedUserDialog() {
  console.log("unauthorized access to user profile");
    $('.authorized').attr('disabled', 'true').attr('readonly', 'true').attr('title', "Not Available").css('display', 'none') ;
    $('.authorized_edit').attr('readonly', 'true').attr('title', " ") ;
    $('#cancel_button_user_profile').click(function() {
      $('#user_profile_dialogg').fadeOut('500s') ;
      $('#upper_navigation').css('display', 'block');
      $('#content').css('display', 'block') ;
      location.reload() ;
    });

    $('#upper_navigation').css('display', 'none');

    $('#user_profile_dialogg').css('display', 'block') ;
    console.log(document.getElementById('user_profile_dialogg').style.display);
}
function authorizedUserDialog() {
  console.log("authorized access to user_profile");
    $('#cancel_button_user_profile').click(function() {
      $('#user_profile_dialogg').fadeOut('500s') ;
      $('#upper_navigation').css('display', 'block');
      $('#content').css('display', 'block') ;
      location.reload();
    });

    $('#upper_navigation').css('display', 'none');

    $('#user_profile_dialogg').css('display', 'block') ;
    console.log(document.getElementById('user_profile_dialogg').style.display);
}

function showUserProfileDialog(user_name, access_type, uploader_profile_picture, smiles, meh, frowns, user_description, no_of_stickers_count) {
  $("#user_profile_dialogg #user_profile_view #user_first_intro #profile_picture_chooser img").attr('src', uploader_profile_picture) ;
  $("#user_profile_dialogg #user_profile_view #user_first_intro #earnings #smiles_count").text(smiles) ;
  $("#user_profile_dialogg #user_profile_view #user_first_intro #earnings #meh_count").text(meh) ;
  $("#user_profile_dialogg #user_profile_view #user_first_intro #earnings #frowns_count").text(frowns) ;

  // setting the username and the user description
  $("#user_profile_dialogg #user_profile_view #user_first_intro #user_name").text(user_name) ;
  $("#user_profile_dialogg #user_profile_view #user_first_intro #description").val(user_description) ;

  $("#user_profile_dialogg #user_profile_view #user_first_intro #no_of_stickers_count").text(no_of_stickers_count) ;

// Allow AUTHORIZED USER OPTIONS ONLY IF THE WINDOW SIZE OF THE BROWSER IS MORE THAN 600PX .
  if (access_type === "unauthorized" || $(window).width()<600) {
    unauthorizedUserDialog() ;
  }
  else {
    authorizedUserDialog() ;
  }
}

// to view profile of users
function viewUserProfile(data) {
  showLoginSignup() ;
  console.log("data is "+data);
  let datavalue = {} ;
  if(data ==="current_user") {
    datavalue.current_user = "current_user" ;
    datavalue.sticky_id = "undefined" ;
  }
  else {
    datavalue.sticky_id = data ;
  }
  showMainLoader() ;

  $.ajax({
    url: "users/get_user_details",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(datavalue),
    success: function(data) {
      // first display the user_profile_dialog and then initialize it.
      let access_type = data.access_type ;
      let uploader_profile_picture = data.urlOfProfilePicture ;
      let user_name = data.user_name ;
      let user_description = data.user_description ;
      let smiles = data.smile ;
      let meh = data.meh ;
      let frowns = data.frown ;
      let no_of_stickers_count = data.no_of_stickers_uploaded ;
      let sticky_id_s = data.sticky_id_s ;

      if (uploader_profile_picture === "default") {
        uploader_profile_picture = "public/images/user.png" ;
      }

      showUserProfileDialog(user_name, access_type, uploader_profile_picture, smiles, meh, frowns, user_description, no_of_stickers_count) ;

      let desired_sticky_id_s = [] ;
      for(let i in sticky_id_s) {
        desired_sticky_id_s.push(sticky_id_s[i]._id) ;
      }
      if(no_of_stickers_count === 0) {
        desired_sticky_id_s = "none" ;
      }

      let deletebutton  = false ;
      if(access_type === "authorized") {
        deletebutton = true ;
      }
      //showLoaderWithinAnElement('list_of_sticky_uploaded_by_the_user');
      generateListOfStickyInTheContainerElement('.list_grid','list-grid-item',false, 'list_of_sticky_uploaded_by_the_user', desired_sticky_id_s, deletebutton) ;
      //hideLoaderWithinAnElement('list_of_sticky_uploaded_by_the_user') ;

      // now hide the content (homepage list of stickys) ;
      $('#content').fadeOut(200)

      // now make a copy of the original profile_picture image
      getPreviousProfilePictureString();

    },
    error: function() {
      console.log("some error occured");
      $('#list_of_sticky_uploaded_by_the_user').text("List of Uploaded stickers is not available") ;
      hideMainLoader() ;
    }
  })
}

function updateUserProfile() {
  // the user_id is retrieved using session in the server.
  showMainLoader() ;

  let object = {} ;
  object.user_image = newProfilePictureString ;
  console.log("object is ");
  console.log(object);
  object.description = $('#user_profile_view #user_first_intro #user_description #description').val() ;

  if(newProfilePictureSameAsOld) {
    // it means that the profile picture has not been changed.
    object.user_image = "undefined" ;
  }
  $.ajax({
    url: "users/update_profile",
    method: "POST",
    contentType: "application/json",
    data : JSON.stringify(object),
    success: function() {
      // the profile has been successfully updated.
      hideMainLoader() ;
      location.reload() ;
      showNotification("Profile Successfully Updated. ", "green") ;
    },
    error: function() {
      hideMainLoader() ;
      showNotification("Profile could not be successfully updated.", "red") ;
    }
  })
}

// this function is used to get base64 notation of the images.
function getBase64(file) {
   var reader = new FileReader();

   reader.readAsDataURL(file);
   reader.onload = function () {

   };
   reader.onerror = function (error) {
     console.log('Error: ', error);
   };
}

// this function is used to get the original profile picture of the user as in the user profile dialog.
function getPreviousProfilePictureString() {
  let canvas = document.createElement('canvas') ;
  canvas.width = 200 ;
  canvas.height = 200 ;

  let originalImage = new Image() ;
  originalImage.src = $('#user_profile_view #user_first_intro #profile_picture_chooser img').attr('src') ;

  canvas.getContext('2d').drawImage(originalImage, 0,0,200,200) ;

  originalProfilePictureString = canvas.toDataURL('image/*') ;
}

// this function shows the confirm_profile_picture_modal
// ALSO // this function will verify if new profile picture has been uploaded by the user in the profile picture update screen. It prevents the server from saving multiple
// copies of the same profile picture of the user.

// it first create an image object during the loading of the user profile picture dialog and then during the "save" button is clicked, it is called to verify
// if the profile picture has been changed.
function show_Upload_Profile_Picture_Confirm_DialogBox() {
  //  console.log(getBase64(document.getElementById('choose_profile_picture').files[0]));
  var reader = new FileReader();

  reader.readAsDataURL(document.getElementById('choose_profile_picture').files[0]);
  reader.onload = function () {
    $('#upload_profile_picture_confirm_dialog_box #container_of_profile_picture img').attr('src',reader.result);
    $('#confirm_profile_picture_modal, #upload_profile_picture_confirm_dialog_box').fadeIn(500) ;

    newProfilePictureString = reader.result ;

    if(reader.result === originalProfilePictureString) {
      newProfilePictureSameAsOld = true;
    }
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
}

function hideUploadProfilePictureConfirmDialog() {
  $('#upload_profile_picture_confirm_dialog_box #container_of_profile_picture img').attr('src',"");
  $('#confirm_profile_picture_modal, #upload_profile_picture_confirm_dialog_box').fadeOut(500) ;
}

// this function will set the local profile picture of the user_profile dialog same as those uploaded by the user
function setProfilePictureOfTheUser() {
  $("#user_profile_view #user_first_intro #profile_picture_chooser img").attr('src', newProfilePictureString) ;
  hideUploadProfilePictureConfirmDialog() ;
}
