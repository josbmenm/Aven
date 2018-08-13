#
# Qt5 WebEngine Kiosk Runner
# deps: apt-get install python-pyqt5.qtwebengine
#
import sys, os
from PyQt5.QtCore import QUrl
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QWidget, QBoxLayout, QPushButton
from PyQt5.QtWebEngineWidgets import QWebEngineView

# Show top bar with buttons for reload & quit
KIOSK_DEBUG = False
# Run bare-metal with eglfs
KIOSK_EGLFS = False
KIOSK_URL = "https://k.onofood.co/"

class Kiosk(QWidget):
  def __init__(self, app):
    QWidget.__init__(self)
    self.app = app
    self.webview = QWebEngineView()
    vboxLayout = QBoxLayout(QBoxLayout.TopToBottom)
    vboxLayout.setContentsMargins(0,0,0,0)
    self.setLayout(vboxLayout)
    if KIOSK_DEBUG:
      vboxLayout.addWidget(self.buildDebugBar())
    vboxLayout.addWidget(self.webview)

  def load(self):
    self.webview.load(QUrl(KIOSK_URL))

  def buildDebugBar(self):
    close = QPushButton(QIcon.fromTheme("window-close"), "")
    refresh = QPushButton(QIcon.fromTheme("view-refresh"), "")
    close.clicked.connect(self.app.exit)
    refresh.clicked.connect(self.webview.reload)
    hbox = QWidget()
    hboxLayout = QBoxLayout(QBoxLayout.RightToLeft)
    hbox.setLayout(hboxLayout)
    hboxLayout.addWidget(close)
    hboxLayout.addWidget(refresh)
    hboxLayout.addStretch()
    return hbox

def main():
  if KIOSK_EGLFS:
    os.putenv("QT_QPA_ENABLE_TERMINAL_KEYBOARD", "1")
    os.putenv("QT_QPA_PLATFORM", "eglfs")    
  app = QApplication(sys.argv)
  kiosk = Kiosk(app)
  kiosk.load()
  kiosk.showFullScreen()
  sys.exit(app.exec_())
  
if __name__ == "__main__":
  main()
