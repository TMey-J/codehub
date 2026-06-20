watch :http, "https://api.github.com/status", every: 300 do
  if status != 200
    notify :slack, text: "GitHub API status: #{status}"
  end
end

watch :rss, "https://rubyweekly.com/feed" do
  if title && title.include?("Rails")
    notify :email, to: "admin@example.com", subject: "New Rails article", text: link
  end
end
