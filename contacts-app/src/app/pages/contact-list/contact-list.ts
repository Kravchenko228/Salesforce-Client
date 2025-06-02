import { Component, OnInit } from '@angular/core';
import { ContactsService } from '../../services/contacts.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './contact-list.html',
  styleUrls: ['./contact-list.scss']
})
export class ContactList implements OnInit {
  groupedContacts: { [key: string]: any[] } = {}
  contacts: any[] = [];
  loading = true;
  error = '';



  constructor(private contactsService: ContactsService, private router: Router, private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Contacts App');
    this.contactsService.getContacts().subscribe({
      next: (data) => {
        this.groupedContacts = this.groupByFirstLetter(data);
        this.loading = false;
      }
      ,
      error: (err) => {
        this.error = 'Failed to load contacts. Please try again later.';
        console.error('Error fetching contacts:', err);
        this.loading = false;
      }
    });
  }

  groupByFirstLetter(contacts: any[]): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};
    contacts.forEach(contact => {
      const letter = contact.name?.[0]?.toUpperCase() || '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(contact);
    });

    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as { [key: string]: any[] });
  }

  viewContact(contactId: number): void {
    this.router.navigate(['/contact', contactId]);
  }
  addRandomContacts(): void {
    this.contactsService.addRandomContacts().subscribe({
      next: () => this.ngOnInit(),
      error: err => console.error('Failed to add random contacts', err)
    });
  }

  newContact(): void {
    this.router.navigate(['/contact/new']);
  }

}
