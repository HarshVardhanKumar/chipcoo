var dummyimage = "https://1l72it1fanlr64wlk5io4t13-wpengine.netdna-ssl.com/wp-content/themes/flatsome-child/assets/images/dummy-img.jpg" ;
function check_for_image_and_get_image_in_sticky_creation_form() {
  var url = document.getElementById('insert_link_of_image').value.toString() ;
  var image = "<img src='https://1l72it1fanlr64wlk5io4t13-wpengine.netdna-ssl.com/wp-content/themes/flatsome-child/assets/images/dummy-img.jpg'/>";
  var dummyimage = "https://1l72it1fanlr64wlk5io4t13-wpengine.netdna-ssl.com/wp-content/themes/flatsome-child/assets/images/dummy-img.jpg" ;

  var image_stick_creation_dialog = $('#image_of_image_stick_creation_dialog') ;
  image_stick_creation_dialog.attr('src',url) ;
  image_stick_creation_dialog.attr('onerror','"this.onerror=null;this.src='+dummyimage+'"') ;

  $('#stick_creation_dialog_modal').fadeIn(500) ;
  $('#stick_creation_dialog').fadeIn(500) ;

  console.log(image_stick_creation_dialog.src) ;
  document.getElementById('insert_link_of_image').value = "" ;

  // hide the add_Using_Website_DialogBox alongwith the modal.
  Show_close_Add_Using_Website_DialogBox() ;
}

function cancel_stick_creation_dialog() {
  var sticky_creation_dialog = document.getElementById('stick_creation_dialog') ;
  sticky_creation_dialog.style.display = "none" ;

  Show_close_Add_Using_Website_DialogBox() ;
}

function clear_stick_creation_dialog() {
  document.getElementById("upper_part_stick_creation_dialog_title").value = "" ;
  document.getElementById("image_of_image_stick_creation_dialog").src = dummyimage ;
  document.getElementById("description_stick_creation_dialog_text").value = "" ;
}

/* Defined in the index.js file
function createNewSticky(title, image, description, _id, smiles, meh, frowns) {

  var content = document.getElementById('content') ;
  var sticky =  "<div class='grid-item'><div id='"+_id+"' class='body_sticky'><div class = 'sticky_title'>"+title+"</div><div class = 'sticky_image'><img class='sticky_imag' src="+image+" width=250 /></div><div class='sticky_rating'><span class='ratings'><span class='ratingsvalue'>"+smiles+"</span><i class='fa fa-smile-o' aria-hidden='true'></i><span class='ratingsvalue'>"+meh+"</span><i class='fa fa-meh-o' aria-hidden='true'></i><span class='ratingsvalue'>"+frowns+"</span><i class='fa fa-frown-o' aria-hidden='true'></i></span></div></div></div>"

  content.innerHTML+=sticky ;
}
*/

function create_stick() {
  var title = document.getElementById('upper_part_stick_creation_dialog_title').value ;
  var image = document.getElementById('image_of_image_stick_creation_dialog').src ;
  var description = document.getElementById('description_stick_creation_dialog_text').value ;
  /* stick id will be added at the server side using session.*/
  var object = {} ;
  object.title = title ;
  object.image = image ;
  object.description = description ;
  showMainLoader() ;
  $('#sticky_creation_dialog').fadeOut(200) ;
  
  // html for creating the new sticky visible to the users
  $.ajax({
    url: "data/create_sticky",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(object),
    success: function(data) {
      // the data has been sent.
      clear_stick_creation_dialog() ;
      cancel_stick_creation_dialog() ;
      console.log(data) ;
      hideMainLoader() ;
      location.reload() ;
    },
    error: function(data) {
      // some error occured
      clear_stick_creation_dialog() ;
      cancel_stick_creation_dialog() ;

      showNotification(data.responseText, "red") ;
      hideMainLoader() ;
    }
  })
}
