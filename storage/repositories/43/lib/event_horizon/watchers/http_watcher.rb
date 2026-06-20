module EventHorizon
  class HttpWatcher < Watcher
    def fetch
      uri = URI(@name)
      response = Net::HTTP.get_response(uri)
      {
        status: response.code.to_i,
        body: response.body,
        headers: response.each_header.to_h
      }
    rescue => e
      LOGGER.error "HTTP fetch error: #{e.message}"
      nil
    end
  end
end
