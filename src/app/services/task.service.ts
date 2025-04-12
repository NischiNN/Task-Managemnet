// src/app/services/task.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CustomStorageService } from "./custom.service";
import { ToasterService } from "./toaster.service";

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  hostUrl = environment.apiUrl;
  requestInterceptMap: any = {};

  constructor(private http: HttpClient, private customStorageService: CustomStorageService, private toasterService: ToasterService) { }

  getTasks() {
    let apiUrl: string = `${this.hostUrl}/task`;
    return this.getQuery(apiUrl);
  }

  getTaskById(id: number) {
    let apiUrl: string = `${this.hostUrl}/${id}`;
    return this.getQuery(apiUrl);
  }

  createTask(task: any) {
    var apiUrl = `${this.hostUrl}/task`
    return this.postQuery(apiUrl, task);
  }

  updateTask(task: any, id: string) {
    var apiUrl = `${this.hostUrl}/task/${id}`
    return this.putQuery(apiUrl, task);
  }

  deleteTask(id: number) {
    var apiUrl = `${this.hostUrl}/task/${id}`
    return this.deleteQuery(apiUrl);
  }

  userLogin(data: any) {
    let headers = new HttpHeaders()
      .set("Content-Type", "application/json")
    return this.http
      .post(`${this.hostUrl}/user/login`, JSON.stringify(data), { headers, withCredentials: true, observe: 'response' }).pipe(
        map((response: any) => {
          localStorage.setItem("clearLocalStorageTime", "" + new Date().getTime());
          sessionStorage.setItem("clearSessionStorageTime", "" + new Date().getTime());
          return { result: response.body, status: response.status };
        }));
  }

  createUser(name: any, email: any, password: any) {
    var apiUrl = `${this.hostUrl}/user/signup`;
    var userData: any = {}
    userData["name"] = name
    userData["email"] = email
    userData["password"] = password
    return this.postQuery(apiUrl, userData);
  }

  deleteQuery(url: string, showErrorToast = true) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(url, { headers, withCredentials: true, observe: 'response' })
      .pipe(
        map((response: any) => ({ result: response.body, status: response.status })),
        catchError((err: any) => this.handleError(err, showErrorToast))
      );
  }

  postQuery(url: string, user: any, showErrorToast = true, contentType: any = undefined) {
    let headers = new HttpHeaders()
      .set("Content-Type", contentType ? contentType : "application/json")
    return this.http
      .post(url, JSON.stringify(user), { headers, withCredentials: true, observe: 'response' }).pipe(
        map((response: any) => ({ result: response.body, status: response.status })),
        catchError((err: any) => this.handleError(err, showErrorToast))
      );
  }

  putQuery(url: any, user: any, showErrorToast = true) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(url, JSON.stringify(user), { headers, withCredentials: true, observe: 'response' }).pipe(
      map((response: any) => ({ result: response.body, status: response.status })),
      catchError((err: any) => this.handleError(err, showErrorToast))
    );
  }

  getQuery(url: string, showErrorToast = true) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(url, {
      headers,
      withCredentials: true, observe: 'response'
    }).pipe(
      map((response: any) => ({ result: response.body, status: response.status })),
      catchError((err: any) => this.handleError(err, showErrorToast))
    );
  }


  handleError(error: HttpErrorResponse | any, showErrorToast = true) {
    return throwError(() => ({
      res: (error?.status && showErrorToast ? this.toasterService.error(error?.error?.data['details']) : null),
      status: error.status,
      message: error?.error?.message,
      error: error?.error
    }));
  }


}
