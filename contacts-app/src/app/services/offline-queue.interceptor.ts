import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-queue-db', 1);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function enqueueRequest(toQueue: any): Promise<void> {
  return openQueueDb().then(db => {
    return new Promise<void>((res, rej) => {
      const tx = db.transaction('pendingRequests', 'readwrite');
      tx.objectStore('pendingRequests').add(toQueue);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  });
}
function drainQueueAndSend(handler: HttpHandler) {
  openQueueDb().then(db => {
    const tx = db.transaction('pendingRequests', 'readwrite');
    const store = tx.objectStore('pendingRequests');
    const getAll = store.getAll();
    getAll.onsuccess = () => {
      const allItems = getAll.result as any[];
      allItems.forEach(item => {
        const req = new HttpRequest(item.method, item.url, item.body, {
          headers: item.headers
        });
        handler.handle(req).subscribe({
          next: () => {
            const delTx = db.transaction('pendingRequests', 'readwrite');
            delTx.objectStore('pendingRequests').delete(item.id);
          },
          error: (err) => {
            console.error('Failed replaying queued request', err);
          }
        });
      });
    };
  });
}

@Injectable({ providedIn: 'root' })
export class OfflineQueueInterceptor implements HttpInterceptor {
  constructor() {
    window.addEventListener('online', () => {
      drainQueueAndSend(this._handler!);
    });
  }

  private _handler: HttpHandler | null = null;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._handler = next;

    if (
      !navigator.onLine &&
      ['POST', 'PUT', 'DELETE'].includes(req.method) &&
      req.url.startsWith('/api/contacts')
    ) {
      // Serialize
      const toQueue = {
        url: req.urlWithParams,
        method: req.method,
        body: req.body,
        headers: req.headers.keys().reduce((acc: any, k) => {
          acc[k] = req.headers.getAll(k);
          return acc;
        }, {}),
        id: Date.now()
      };
      return from(
        enqueueRequest(toQueue).then(() => {
          return new HttpResponse({ status: 202, body: { queued: true } });
        })
      ) as Observable<HttpEvent<any>>;
    }

    return next.handle(req);
  }
}
