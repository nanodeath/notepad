var default_settings = {
    note_x: "400px",
    note_y: "200px",
};

$(function(){
    $(".resizable").resizable({ handles: 'all' });
    $("#box").draggable({handle: $("#handle")});
    $("#desktop").click(function(e){
        console.log("you clicked on desktop");
        var note = $("<div class='note ui-draggable ui-dialog'></div>")
            .resizable({handles: 'all'});
        note.appendTo("#notes");
        note.css({left: e.pageX - 200, top: e.pageY - 100});
        note.show("slide", {}, 1000, function(){
          $.post('/notes.json', {'note[user_id]': '', 'note[body]': '', 'note[position_x]': note.css('left'), 'note[position_y]': note.css('top')}, function(data){
            if(data.status == 'success'){
              console.log("Note created successfully");
              note.data('id', data.note_id);
            } else {
              console.log("Note not created successfully");              
            }
          });
        });

        var handle = $("<div class='note_handle ui-dialog-titlebar'><span class='note_handle_left'>Bar</span>&nbsp;</div>");
        
        var close_link = $("<a href='javascript:void(0);'>X</a>").click(function(){
            note.remove();
        });
        var small_size = 0.1;
        
        var hide_link = $("<a href='javascript:void(0);'>_</a>").click(function(){
            note.resizable("disable");
            note.draggable("destroy");
            note.effect("scale", {percent: 100*small_size}, 500, function(){note.state = 'small';});
            textarea.hide();
            //textarea.attr("disabled", "disabled");
            note.draggable();
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
              //textarea.attr("disabled", "");
            });
          }
        });
        
        handle.appendTo(note);
        $("<span class='note_handle_right'></span>").append(hide_link).append(close_link).prependTo(handle);
        var textarea = $("<textarea></textarea>").appendTo(note);

        textarea.keypress(function(){
            if(textarea.data('ajax_timer')) clearTimeout(textarea.data('ajax_timer'));
            note.addClass("unsaved");
            var delayed_action = setTimeout(function(e){
                var old_data = textarea.data('old_data');
                var new_data = textarea.val();
                if(old_data != new_data){
                    console.log("something to update");
                    textarea.data('old_data', new_data);
                }
                note.removeClass("unsaved");
            }, 5000);
            textarea.data('ajax_timer', delayed_action);
        });

        note.resizable({handles: 'all', alsoResize: textarea});
        note.draggable({handle: handle});
    });
});
