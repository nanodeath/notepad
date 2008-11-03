class Notes < Application
  provides :xml, :yaml, :json

  def index
    if !(session.user.nil? && cookies[:user_id].nil?)
      @user_id = cookies[:user_id] || session.user.id
      @note = Note.all :user_id => @user_id
    else
      @note = []
    end
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
      if request.ajax?
        display @note
      else
        redirect resource(@note), :message => {:notice => "Note was successfully created"}
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
      @status = 'success'
      @status = 'you said error' if @note.body =~ /error/ # for testing
      if request.ajax?
        display @note, :create
      else
        redirect resource(@note)
      end
    else
      if @note.errors.length == 0
        @status = 'success'
      else
        @status = 'failure'
      end
      if request.ajax?
        display @note, :create
      else
        display @note, :edit        
      end

    end
  end

  def destroy(id)
    @note = Note.get(id)
    raise NotFound unless @note
    if @note.destroy
      @status = 'success'
      if request.ajax?
        render :delete
      else
        redirect resource(:note)
      end
    else
      raise InternalServerError
    end
  end

end # Note
