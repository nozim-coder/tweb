import Scrollable from "./scrollable_new";
import appMessagesManager, { Dialog } from "../lib/appManagers/appMessagesManager";
import { $rootScope, cancelEvent, findUpClassName, findUpTag, findUpAttribute } from "../lib/utils";
import appDialogsManager from "../lib/appManagers/appDialogsManager";
import appChatsManager from "../lib/appManagers/appChatsManager";
import appUsersManager from "../lib/appManagers/appUsersManager";
import appPeersManager from "../lib/appManagers/appPeersManager";
import appPhotosManager from "../lib/appManagers/appPhotosManager";

export class AppSelectPeers {
  public container = document.createElement('div');
  public list = document.createElement('ul');
  public chatsContainer = document.createElement('div');
  public scrollable: Scrollable;
  public selectedScrollable: Scrollable;
  
  public selectedContainer = document.createElement('div');
  public input = document.createElement('input');
  
  //public selected: {[peerID: number]: HTMLElement} = {};
  public selected = new Set<any>();

  public freezed = false;

  private myID = $rootScope.myID;

  private offsetIndex = 0;
  private promise: Promise<any>;

  private query = '';
  private cachedContacts: number[];
  
  constructor(private appendTo: HTMLElement, private onChange?: (length: number) => void, private peerType: 'contacts' | 'dialogs' = 'dialogs', onFirstRender?: () => void, private renderResultsFunc?: (peerIDs: number[]) => void) {
    this.container.classList.add('selector');

    if(!this.renderResultsFunc) {
      this.renderResultsFunc = this.renderResults;
    }

    let topContainer = document.createElement('div');
    topContainer.classList.add('selector-search-container');

    this.selectedContainer.classList.add('selector-search');
    this.input.placeholder = peerType == 'contacts' ? 'Add People...' : 'Select chat';
    this.input.type = 'text';
    this.selectedContainer.append(this.input);
    topContainer.append(this.selectedContainer);
    this.selectedScrollable = new Scrollable(topContainer);

    let delimiter = document.createElement('hr');

    this.chatsContainer.classList.add('chats-container');
    this.chatsContainer.append(this.list);
    this.scrollable = new Scrollable(this.chatsContainer);
    this.scrollable.setVirtualContainer(this.list);

    this.chatsContainer.addEventListener('click', (e) => {
      const target = findUpAttribute(e.target, 'data-peerID') as HTMLElement;
      cancelEvent(e);

      if(!target) return;
      if(this.freezed) return;

      let key: any = target.getAttribute('data-peerID');
      key = +key || key;
      target.classList.toggle('active');
      if(this.selected.has(key)) {
        this.remove(key);
      } else {
        this.add(key);
      }

      const checkbox = target.querySelector('input') as HTMLInputElement;
      checkbox.checked = !checkbox.checked;
    });

    this.selectedContainer.addEventListener('click', (e) => {
      if(this.freezed) return;
      let target = e.target as HTMLElement;
      target = findUpClassName(target, 'selector-user');

      if(!target) return;

      const peerID = target.dataset.key;
      const li = this.chatsContainer.querySelector('[data-peerid="' + peerID + '"]') as HTMLElement;
      if(!li) {
        this.remove(+peerID || peerID);
      } else {
        li.click();
      }
    });

    this.input.addEventListener('input', () => {
      let value = this.input.value;
      if(this.query != value) {
        if(this.peerType == 'contacts') {
          this.cachedContacts = null;
        } else {
          this.offsetIndex = 0;
        }

        this.promise = null;
        this.list.innerHTML = '';
        this.query = value;
        
        //console.log('selectPeers input:', this.query);
        this.getMoreResults();
      }
    });

    this.scrollable.onScrolledBottom = () => {
      this.getMoreResults();
    };

    this.container.append(topContainer, delimiter, this.chatsContainer);
    appendTo.append(this.container);

    // WARNING TIMEOUT
    setTimeout(() => {
      let getResultsPromise = this.getMoreResults() as Promise<any>;
      if(onFirstRender) {
        getResultsPromise.then(() => {
          onFirstRender();
        });
      }
    }, 0);
  }

  private async getMoreDialogs() {
    if(this.promise) return this.promise;
    
    // в десктопе - сначала без группы, потом архивные, потом контакты без сообщений
    const pageCount = appPhotosManager.windowH / 72 * 1.25 | 0;

    this.promise = appMessagesManager.getConversations(this.query, this.offsetIndex, pageCount, 0);
    const value = await this.promise;

    let dialogs = value.dialogs as Dialog[];
    if(!dialogs.length) {
      return;
    }
    
    const newOffsetIndex = dialogs[dialogs.length - 1].index || 0;

    dialogs = dialogs.filter(d => d.peerID != this.myID);
    if(!this.offsetIndex && !this.query) {
      dialogs.unshift({
        peerID: this.myID,
        pFlags: {}
      } as any);
    }

    this.offsetIndex = newOffsetIndex;

    this.renderResultsFunc(dialogs.map(dialog => dialog.peerID));

    this.promise = null;
  }

  private async getMoreContacts() {
    if(this.promise) return this.promise;

    if(!this.cachedContacts) {
      this.promise = appUsersManager.getContacts(this.query);
      this.cachedContacts = (await this.promise).slice();
      this.cachedContacts.findAndSplice(userID => userID == this.myID); // no my account
      this.promise = null;
    }

    if(this.cachedContacts.length) {
      const pageCount = appPhotosManager.windowH / 72 * 1.25 | 0;
      const arr = this.cachedContacts.splice(0, pageCount);
      this.renderResultsFunc(arr);
    }
  }

  private getMoreResults() {
    if(this.peerType == 'dialogs') {
      return this.getMoreDialogs();
    } else {
      return this.getMoreContacts();
    }
  }

  private renderResults(peerIDs: number[]) {
    //console.log('will renderResults:', peerIDs);
    peerIDs.forEach(peerID => {
      const {dom} = appDialogsManager.addDialog(peerID, this.scrollable, false, false);

      const selected = this.selected.has(peerID);
      dom.containerEl.insertAdjacentHTML('afterbegin', `<div class="checkbox"><label><input type="checkbox" ${selected ? 'checked' : ''}><span></span></label></div>`);
      if(selected) dom.listEl.classList.add('active');

      let subtitle = '';
      if(peerID < 0) {
        subtitle = appChatsManager.getChatMembersString(-peerID);
      } else if(peerID == this.myID) {
        subtitle = 'chat with yourself';
      } else {
        subtitle = appUsersManager.getUserStatusString(peerID);
        if(subtitle == 'online') {
          subtitle = `<i>${subtitle}</i>`;
        }
      }

      dom.lastMessageSpan.innerHTML = subtitle;
    });
  }

  public add(peerID: any, title?: string) {
    //console.trace('add');
    const div = document.createElement('div');
    div.classList.add('selector-user', 'scale-in');

    const avatarEl = document.createElement('avatar-element');
    avatarEl.classList.add('selector-user-avatar', 'tgico');
    avatarEl.setAttribute('dialog', '1');

    div.dataset.key = '' + peerID;
    this.selected.add(peerID);
    if(typeof(peerID) === 'number') {
      if(title === undefined) {
        title = peerID == $rootScope.myID ? 'Saved' : appPeersManager.getPeerTitle(peerID, false, true);
      }

      avatarEl.setAttribute('peer', '' + peerID);
    }

    if(title) {
      div.innerHTML = title;
    }

    div.insertAdjacentElement('afterbegin', avatarEl);

    this.selectedContainer.insertBefore(div, this.input);
    //this.selectedScrollable.scrollTop = this.selectedScrollable.scrollHeight;
    this.selectedScrollable.scrollTo(this.selectedScrollable.scrollHeight, true, true);
    this.onChange && this.onChange(this.selected.size);

    return div;
  }

  public remove(key: any) {
    //const div = this.selected[peerID];
    const div = this.selectedContainer.querySelector(`[data-key="${key}"]`) as HTMLElement;
    div.classList.remove('scale-in');
    void div.offsetWidth;
    div.classList.add('scale-out');
    div.addEventListener('animationend', () => {
      this.selected.delete(key);
      div.remove();
      this.onChange && this.onChange(this.selected.size);
    }, {once: true});
  }

  public getSelected() {
    return [...this.selected];
  }
}