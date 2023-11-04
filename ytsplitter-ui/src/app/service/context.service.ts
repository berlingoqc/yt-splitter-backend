import { Injectable } from "@angular/core";

export interface Context {
  backendURL: string;
  password: string;
}

@Injectable({providedIn: 'root'})
export class ContextService {
  private pcontext: Context;

  constructor() {
    this.loadContext();
  }

  get context() {
    return this.pcontext;
  }

  set context(context: Context) {
    this.pcontext = context;
    localStorage.setItem('context', JSON.stringify(this.pcontext));
  }

  get url() {
    return this.pcontext.backendURL;
  }

  private loadContext() {
    const str = localStorage.getItem('context');
    if(str) {
      this.pcontext = JSON.parse(str);
    }

    this.pcontext = { backendURL: '/api', password: ''};
  }

}
