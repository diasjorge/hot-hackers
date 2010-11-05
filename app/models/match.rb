require 'digest/sha1'

class Match
  K_FACTOR = 32

  attr_accessor :left_hacker, :right_hacker, :signature, :token

  def initialize
    num_hackers = Hacker.count
    left_offset = right_offset = rand(num_hackers)
    right_offset = rand(num_hackers) until left_offset != right_offset
    self.left_hacker = Hacker.first :offset => left_offset
    self.right_hacker = Hacker.first :offset => right_offset

    self.token = SecureRandom.hex(10)
    self.signature = self.class.calculate_signature(self.left_hacker.id,
                                                    self.right_hacker.id,
                                                    self.token)
  end

  def self.calculate_rankings!(match, match_token)
    if match[:signature] != self.calculate_signature(match[:left_hacker_id],
                                                     match[:right_hacker_id],
                                                     match_token)
      raise InvalidRequestError
    end

    left_hacker = Hacker.find match[:left_hacker_id]
    right_hacker = Hacker.find match[:right_hacker_id]
    winner = match[:winner].to_i

    q_left = 10**(left_hacker.ranking / 400.0)
    q_right = 10**(right_hacker.ranking / 400.0)
    denominator = q_left + q_right
    e_left = q_left / denominator
    e_right = q_right / denominator

    s_left, s_right = left_hacker.id == winner ? [1, 0] : [0, 1]
    left_hacker.ranking = left_hacker.ranking + K_FACTOR * (s_left - e_left)
    right_hacker.ranking = right_hacker.ranking + K_FACTOR * (s_right - e_right)

    Hacker.transaction do
      left_hacker.save!
      right_hacker.save!
    end

    left_hacker.id == winner ? left_hacker : right_hacker
  end

  def self.calculate_signature(left_id, right_id, match_token)
    Digest::SHA1.hexdigest("#{match_token}---#{left_id}---#{right_id}")
  end
end
