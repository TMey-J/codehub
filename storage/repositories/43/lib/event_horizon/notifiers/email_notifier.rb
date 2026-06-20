module EventHorizon
  class EmailNotifier < Notifier
    def deliver
      from = @params[:from] || ENV["SMTP_FROM"]
      to = @params[:to]
      subject = @params[:subject]
      body = @params[:body] || @params[:text]
      smtp = Net::SMTP.new(ENV["SMTP_HOST"] || "localhost", ENV["SMTP_PORT"]&.to_i || 25)
      smtp.start do |s|
        msg = <<~EOM
          From: #{from}
          To: #{to}
          Subject: #{subject}

          #{body}
        EOM
        s.send_message(msg, from, to)
      end
    end
  end
end
