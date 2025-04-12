import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomStorageService {
 
  constructor() { }

  setItem(key: string, value: string) {
    if(key=='token'){
       sessionStorage.setItem(key,value);
    } else {
      localStorage.setItem(key, value);
    }
    
  }


  getItem(item: string) {
    // this.handleLogoutAndLogin();
    if(item=='token'){
      return sessionStorage?.getItem(item) ? sessionStorage.getItem(item) : localStorage.getItem(item);
    }
    return localStorage.getItem(item);
  }

  clear(){
    localStorage.clear();
    sessionStorage.clear();
  }

  removeItem(key: string) {
    if(key=='token'){
      sessionStorage.removeItem(key);
   }
   localStorage.removeItem(key);
  }

  //Handle case of different user login in different tabs. Same user should be visible in all tabs. 
  handleLogoutAndLogin(){
    //clearSessionStorageTime is not present (Generally when new tab is opened), but clearLocalStorageTime is present
    // In this case just set clearSessionStorageTime
    if((!sessionStorage.getItem("clearSessionStorageTime") && localStorage.getItem("clearLocalStorageTime"))){
      sessionStorage.setItem("clearSessionStorageTime", ""+new Date().getTime());
    }
    //Other tab was logged out. In that case clearLocalStorageTime won't be present but 
    //clearSessionStorageTime would be present. So in this case clear the sessionStorage and reload it will 
    //reach to login window
    if((sessionStorage.getItem("clearSessionStorageTime") && !localStorage.getItem("clearLocalStorageTime"))){
      sessionStorage.clear();
      window.location.reload();
    }
  }
}
