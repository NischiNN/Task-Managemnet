import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomStorageService } from 'src/app/services/custom.service';
import { TaskService } from 'src/app/services/task.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  selector: "app-login",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  @Input() returnUrl!: string;
  signUpForm: any;
  emailValue: any;
  passwordTypeAttribute: string = 'password'
  @ViewChild("userForm") userForm: NgForm | undefined;
  showLoginForm: boolean = false;
  showSignupForm: boolean = false;
  showSpinner: boolean = false;
  isAuthenticated: any = ''

  constructor(private taskService: TaskService, private toaster: ToasterService, private customStorageService: CustomStorageService, private router: Router,) { }

  ngOnInit() {
    this.isAuthenticated = this.customStorageService.getItem('isAuthenticated')
    if (this.isAuthenticated) this.router.navigate(['/auth/register']);
    this.showLoginForm = true
    this.signUpForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      terms: new FormControl(false, [Validators.required])
    })
  }
  togglePassword() {
    this.passwordTypeAttribute = this.passwordTypeAttribute == 'text' ? 'password' : 'text'
  }
  loadSignupForm() {
    this.showLoginForm = false
    this.showSignupForm = true
  }

  createUser() {
    if (this.signUpForm.invalid) return;
    let name = this.signUpForm.get('name').value;
    let email = this.signUpForm.get('email').value;
    let password = this.signUpForm.get('password').value;
    this.showSpinner = true;
    this.taskService.createUser(name, email, password).subscribe((res: any) => {
      if (res.status == 200) {
        this.showSpinner = false;
        this.toaster.success("Singup is completed")
        this.backToLogin()
      }
    }, err => {
      this.showSpinner = false;
    })
  }

  backToLogin() {
    this.showSignupForm = false;
    this.showLoginForm = true
  }

  userLoginProcess(input: any) {
    this.taskService.userLogin(input).subscribe((data: any) => {
      if (data['status'] == 200) {
        this.onLogin(data["result"]);
      }
    },
      (err) => {
        this.toaster.error(err?.error?.data['details'])
      }
    );
  }
  onLogin(data: any) {
    this.customStorageService.setItem("isAuthenticated", "true");

    const token = data.token;
    const user = data.data;

    this.customStorageService.setItem("token", token);
    this.customStorageService.setItem("loginUserData", JSON.stringify(user));
    this.customStorageService.setItem("name", user?.name);
    this.customStorageService.setItem("id", user?._id);
    this.customStorageService.setItem("email", user?.email);
    this.customStorageService.setItem("user_id", user?.id);

    this.router.navigate(["/auth/register"]);
  }
}
