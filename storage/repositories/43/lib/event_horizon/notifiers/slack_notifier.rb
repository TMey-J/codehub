module EventHorizon
  class SlackNotifier < Notifier
    def deliver
      webhook = @params[:webhook] || ENV["SLACK_WEBHOOK"]
      uri = URI(webhook)
      req = Net::HTTP::Post.new(uri)
      req["Content-Type"] = "application/json"
      req.body = { text: @params[:text] }.to_json
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
        http.request(req)
      end
    end
  end
end
