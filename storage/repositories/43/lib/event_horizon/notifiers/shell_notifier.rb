module EventHorizon
  class ShellNotifier < Notifier
    def deliver
      system(@params[:command])
    end
  end
end
