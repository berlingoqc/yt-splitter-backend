import './server';

import {
    QMainWindow,
    QWidget,
    QLabel,
    FlexLayout,
    QLineEdit,
    QPushButton,
  
    QIcon,
    QPlainTextEdit,
    EchoMode,
    QComboBox,
    QFileDialog,
    FileMode,
    QListWidget,
    QSystemTrayIcon,
    QMenu,
    QAction,
    QMenuBar,
    QApplication,
    QKeySequence
  } from '@nodegui/nodegui';
  

  const logoIcon = new QIcon(
    __dirname + '/logox180.png');



const win = new QMainWindow();
win.setWindowTitle("Xmation file syncer");

const quitAction = new QAction();
quitAction.setText('Quitter');
quitAction.addEventListener('triggered', () => {
  console.log('QUITTING APP');
  const app = QApplication.instance();
  app.exit(0);
});


const showAction = new QAction();
showAction.setText('afficher fenetre');
showAction.setShortcut(new QKeySequence("Alt+S"));
showAction.addEventListener('triggered', () => win.show());

const hideAction = new QAction();
hideAction.setText('cacher fenetre');
hideAction.setShortcut(new QKeySequence("Alt+H"));
hideAction.addEventListener('triggered', () => win.hide());

const menu = new QMenu();
menu.addAction(showAction);
menu.addAction(hideAction);
menu.addSeparator();
menu.addAction(quitAction);

const tray = new QSystemTrayIcon();
tray.setContextMenu(menu);
tray.setIcon(logoIcon);
tray.show();


const qApp = QApplication.instance();
qApp.setQuitOnLastWindowClosed(false);

global.win = win;
global.systemTray = tray;