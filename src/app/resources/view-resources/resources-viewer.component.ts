import { Component, Input, OnChanges, EventEmitter, Output } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ResourcesService } from '../resources.service';

@Component({
  selector: 'planet-resources-viewer',
  templateUrl: './resources-viewer.component.html',
  styleUrls: [ './resources-viewer.scss' ]
})
export class ResourcesViewerComponent implements OnChanges {

  @Input() resource: any;
  mediaType: string;
  contentType: string;
  resourceSrc: string;
  urlPrefix = environment.couchAddress + 'resources/';
  pdfSrc: any;
  private onDestroy$ = new Subject<void>();

  constructor(
    private sanitizer: DomSanitizer,
    private resourcesService: ResourcesService
  ) { }

  ngOnChanges() {
    this.setResource(this.resource);
  }

  setResource(resource: any) {
    this.resource = resource;
    // openWhichFile is used to label which file to start with for HTML resources
    const filename = resource.openWhichFile || Object.keys(resource._attachments)[0];
    this.mediaType = resource.mediaType;
    this.contentType = resource._attachments[filename].content_type;
    this.resourceSrc = this.urlPrefix + resource._id + '/' + filename;
    if (!this.mediaType) {
      const mediaTypes = [ 'image', 'pdf', 'audio', 'video', 'zip' ];
      this.mediaType = mediaTypes.find((type) => this.contentType.indexOf(type) > -1) || 'other';
    }
    if (this.mediaType === 'pdf' || this.mediaType === 'HTML') {
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.resourceSrc);
    }
  }

}
