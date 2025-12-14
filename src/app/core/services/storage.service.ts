import { computed, Injectable, signal } from "@angular/core"
import { User } from "../models/user.model";
import { JwtResponse } from "../models/jwt-response.model";

const USER_KEY ='auth-user'
const TOKEN_KEY='auth-token'

@Injectable({
  providedIn:'root'
})

export class StorageService{
  private userSignal = signal<User | null>(this.getUserFromStorage());

  readonly currentUser = computed(()=>this.userSignal());
  readonly isLoggedIn = computed(()=>this.userSignal()!==null);
  constructor(){
    this.userSignal.set(this.getUserFromStorage())

  }
  clean(): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    this.userSignal.set(null);
  }

  saveUser(user: User): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  saveToken(token: string): void {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  saveUserAndToken(jwtResponse:JwtResponse):void{
    const user:User={
      id:jwtResponse.id,
      username:jwtResponse.username,
      email:jwtResponse.email,
      roles:jwtResponse.roles
    }
    this.saveUser(user);
    this.saveToken(jwtResponse.token);
  }

  getUser():User | null {
    return this.userSignal();
  }


  private getUserFromStorage(): User | null {
    if(typeof window==='undefined'){
      return null;
    }
    const user=window.sessionStorage.getItem(USER_KEY);
    if(user){
      try{
        return JSON.parse(user);
      }catch{
        return null;
      }
    }
    return null;
  }
}
