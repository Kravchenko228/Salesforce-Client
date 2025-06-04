import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ContactsService } from '../../services/contacts.service';
import { FormsModule, } from '@angular/forms';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss'
})
export class ContactDetails implements OnInit {
  contact: any;
  loading = true;
  error = '';
  isEdit = false;
  isNew = false;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactsService: ContactsService,

  ) { }

  ngOnInit(): void {
    const contactId = Number(this.route.snapshot.paramMap.get('id'));
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
      this.isEdit = true;
      this.contact = {
        name: '',
        fullAddress: '',
        email: '',
        phone: '',
        cell: '',
        registrationDate: '',
        age: '',
        imageUrl: ''

      };
    } else {
      this.contactsService.getContact(+id!).subscribe(data => this.contact = data);
    }



    if (isNaN(contactId)) {
      this.error = 'no contact ID';

      this.loading = false;
      return;
    }

    this.contactsService.getContact(contactId).subscribe({
      next: (data) => {
        this.contact = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load contacts details.';
        console.error('Error fetching contact:', err);
        this.loading = false;
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleEdit(): void {
    this.isEdit = true;
  }

  save(): void {
    if (this.isNew) {
      this.contactsService.createContact(this.contact).subscribe(() => this.router.navigate(['/']));
    } else {
      this.contactsService.updateContact(this.contact.id, this.contact).subscribe(() => this.isEdit = false);
    }
  }

  delete(): void {
    if (confirm('Delete this contact?')) {
      this.contactsService.deleteContact(this.contact.id).subscribe(() => this.router.navigate(['/']));
    }
  }

}
