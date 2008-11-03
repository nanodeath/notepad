var default_settings = {
  note: {
    width: 400,
    height: 200,
  }
};

function addNote(position_x, position_y, width, height, title, body, id, animation){
  title = title || 'Note';
  body = body || '';
  animation = animation || 'slide';
  width = width || default_settings.note.width;
  height = height || default_settings.note.height;

  var note = $("<div class='note ui-draggable ui-dialog'></div>");
  note.appendTo("#notes");
  note.css({left: position_x, top: position_y, width: width, height: height});
  note.show(animation, {}, 1000, function(){
    if (id === undefined) {
      $.post('/notes.json', {
        'note[user_id]': '',
        'note[body]': '',
        'note[position_x]': note.css('left'),
        'note[position_y]': note.css('top'),
        'note[width]': note.css('width'),
        'note[height]': note.css('height'),
      }, function(data){
        if (data.status == 'success') {
          console.log("Note " + data.note_id + " created successfully");
          id = data.note_id;
        }
        else {
          console.log("Note not created successfully");
          // Remove/occlude it visually?
        }
      }, 'json');
    }
  });

  var handle = $("<div class='note_handle ui-dialog-titlebar'><span class='note_handle_left'>" + title + " <span id='note_status'></span></span>&nbsp;</div>");
  
  var close_link = $("<a href='javascript:void(0);'>X</a>").click(function(){
      note.remove();
      $.post('/notes/' + id + '.json', {'_method': 'delete'}, function(data){
        if(data.status == 'success'){
          console.log("Note destroyed successfully");
        } else {
          console.error('Note not destroyed successfully');
        }
      }, 'json');
  });
  var small_size = 0.1;
  
  var hide_link = $("<a href='javascript:void(0);'>_</a>").click(function(){
      note.resizable("disable");
      note.effect("scale", {percent: 100*small_size}, 500, function(){note.state = 'small';});
      textarea.hide();
      //textarea.attr("disabled", "disabled");
      close_link.hide();
      hide_link.hide();
      note.state = 'transitioning';
  });
  note.dblclick(function(){
    if(note.state == 'small'){
      note.state = 'transitioning';
      note.effect("scale", {percent: 100/small_size}, 500, function(){
        note.state = 'big';
        close_link.show();
        hide_link.show();
        textarea.show();
        note.resizable("enable");
        //textarea.attr("disabled", "");
      });
    }
  });
  
  handle.appendTo(note);
  $("<span class='note_handle_right'></span>").append(hide_link).append(close_link).prependTo(handle);
  var textarea = $("<textarea>" + body + "</textarea>").appendTo(note);

  textarea.css({width: width - 6, height: height - 55});

  textarea.keypress(function(){
      if(textarea.data('ajax_timer')) clearTimeout(textarea.data('ajax_timer'));
      if(!note.hasClass('unsaved')){
          note.addClass("unsaved");
          $('#note_status', note).text('*');
      }
      var delayed_action = setTimeout(function(e){
          var old_data = textarea.data('old_data');
          var new_data = textarea.val();
          if(old_data != new_data){
              textarea.data('old_data', new_data);
              update_note(note, id);
          }
      }, 5000);
      textarea.data('ajax_timer', delayed_action);
  });

  note.resizable({
    handles: 'all',
    resize: function(){
      $("textarea", note).css({width: parseInt(note.css("width")) - 6});
      $("textarea", note).css({height: parseInt(note.css("height")) - 55});
    },
    stop: function(){
      update_note(note, id);
    }
  });
  note.draggable({
    handle: handle,
    stop: function(){
      update_note(note, id);
    }
  });
}

function update_note(note, id){
  note.addClass("unsaved");
  $('#note_status', note).text(' -- Saving');
  if(parseInt(note.css('top')) < 0) note.css('top', "0px");
          
  $.post('/notes/' + id + '.json', {
    '_method': 'put',
    'note[body]': $('textarea', note).val(),
    'note[position_x]': note.css('left'),
    'note[position_y]': note.css('top'),
    'note[width]': note.css('width'),
    'note[height]': note.css('height'),
  }, function(data){
    if (data.status == 'success') {
      note.removeClass("unsaved");
      note.removeClass("error");
      console.log("Note " + id + " updated successfully");
      $('#note_status', note).text('');
    }
    else {
      note.addClass("error");
      console.error("Note " + id + " not updated successfully");
      $('#note_status', note).text('!');
    }
  }, 'json');
}

$(function(){
    $("#desktop").click(function(e){
        console.log("you clicked on desktop");
        
        addNote(e.pageX - default_settings.note.width/2, e.pageY - default_settings.note.height/2);
        
        $("#click_to_start:visible").fadeOut("normal");
    });
    
    for(var i = notes.length - 1; i >= 0; i--){
      addNote(notes[i].position_x, notes[i].position_y, notes[i].width, notes[i].height, "Note", notes[i].body, notes[i].id, 'show');
    }
});
