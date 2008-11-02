class Notes < Application
  provides :xml, :yaml, :json

  def index
    @note = Note.all
    display @note
  end

  def show(id)
    @note = Note.get(id)
    raise NotFound unless @note
    display @note
  end

  def new
    only_provides :html
    @note = Note.new
    display @note
  end

  def edit(id)
    only_provides :html
    @note = Note.get(id)
    raise NotFound unless @note
    display @note
  end

  def create(note)
    unless session.user.nil?
      note[:user_id] = session.user.id
    end
    if note[:user_id].nil? || note[:user_id] == ''
      if cookies[:user_id].nil? || cookies[:user_id] == ''
        # generate a new user id
        anon_user = User.create_anonymous_user
        cookies.set_cookie('user_id', anon_user.id, :expires => 30.days.from_now)
      end
      note[:user_id] = cookies[:user_id]
    end
    
    @note = Note.new(note)
    if @note.save
      @status = 'success'
      case content_type
        when :html
          redirect resource(@note), :message => {:notice => "Note was successfully created"}
        else
          display @note
      end
    else
      message[:error] = "Note failed to be created"
      render :new
    end
  end

  def update(id, note)
    @note = Note.get(id)
    raise NotFound unless @note
    if @note.update_attributes(note)
       redirect resource(@note)
    else
      display @note, :edit
    end
  end

  def destroy(id)
    @note = Note.get(id)
    raise NotFound unless @note
    if @note.destroy
      redirect resource(:note)
    else
      raise InternalServerError
    end
  end

end # Note
