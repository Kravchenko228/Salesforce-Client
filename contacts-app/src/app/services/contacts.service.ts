import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  apiUrl = "https://userscan.azurewebsites.net"
  constructor(private http: HttpClient) { }
  getContacts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/contacts`);
  }
  getContact(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/contacts/${id}`);
  }
  addContact(contact: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/contacts`, contact);
  }
  updateContact(id: number, contact: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/contacts/${id}`, contact);
  }
  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/contacts/${id}`);
  }
  addRandomContacts(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/contacts/random`, {});
  }
}
