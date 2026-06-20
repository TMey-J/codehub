module EventHorizon
  class RssWatcher < Watcher
    def fetch
      uri = URI(@name)
      response = Net::HTTP.get(uri)
      feed = RSS::Parser.parse(response, false)
      item = feed.items.first
      return nil unless item
      {
        title: item.title,
        link: item.link,
        published_at: item.pubDate,
        description: item.description
      }
    rescue => e
      LOGGER.error "RSS fetch error: #{e.message}"
      nil
    end
  end
end
