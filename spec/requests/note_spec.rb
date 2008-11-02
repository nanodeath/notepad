require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

given "a note exists" do
  Note.all.destroy!
  request(resource(:note), :method => "POST", 
    :params => { :note => { :id => nil }})
end

describe "resource(:note)" do
  describe "GET" do
    
    before(:each) do
      @response = request(resource(:note))
    end
    
    it "responds successfully" do
      @response.should be_successful
    end

    it "contains a list of note" do
      pending
      @response.should have_xpath("//ul")
    end
    
  end
  
  describe "GET", :given => "a note exists" do
    before(:each) do
      @response = request(resource(:note))
    end
    
    it "has a list of note" do
      pending
      @response.should have_xpath("//ul/li")
    end
  end
  
  describe "a successful POST" do
    before(:each) do
      Note.all.destroy!
      @response = request(resource(:note), :method => "POST", 
        :params => { :note => { :id => nil }})
    end
    
    it "redirects to resource(:note)" do
      @response.should redirect_to(resource(Note.first), :message => {:notice => "note was successfully created"})
    end
    
  end
end

describe "resource(@note)" do 
  describe "a successful DELETE", :given => "a note exists" do
     before(:each) do
       @response = request(resource(Note.first), :method => "DELETE")
     end

     it "should redirect to the index action" do
       @response.should redirect_to(resource(:note))
     end

   end
end

describe "resource(:note, :new)" do
  before(:each) do
    @response = request(resource(:note, :new))
  end
  
  it "responds successfully" do
    @response.should be_successful
  end
end

describe "resource(@note, :edit)", :given => "a note exists" do
  before(:each) do
    @response = request(resource(Note.first, :edit))
  end
  
  it "responds successfully" do
    @response.should be_successful
  end
end

describe "resource(@note)", :given => "a note exists" do
  
  describe "GET" do
    before(:each) do
      @response = request(resource(Note.first))
    end
  
    it "responds successfully" do
      @response.should be_successful
    end
  end
  
  describe "PUT" do
    before(:each) do
      @note = Note.first
      @response = request(resource(@note), :method => "PUT", 
        :params => { :article => {:id => @note.id} })
    end
  
    it "redirect to the article show action" do
      @response.should redirect_to(resource(@note))
    end
  end
  
end

