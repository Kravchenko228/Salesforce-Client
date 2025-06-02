import { Routes } from '@angular/router';
import { ContactList } from './pages/contact-list/contact-list';
import { ContactDetails } from './pages/contact-details/contact-details';

export const routes: Routes = [
    {
        path: '',
        component: ContactList,
        title: 'Contact List',
    }
    ,
    {
        path: 'contact/:id',
        component: ContactDetails,
        title: 'Contact Details',

    }

];
