class Note
  include DataMapper::Resource
  
  property :id, Serial
  property :user_id, Integer
  property :body, Text
  property :position_x, Integer
  property :position_y, Integer
  
  belongs_to :user
end
