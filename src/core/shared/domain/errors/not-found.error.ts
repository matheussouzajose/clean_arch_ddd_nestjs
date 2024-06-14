export class NotFoundError extends Error {
  constructor(id: any[] | any) {
    const idsMessage = Array.isArray(id) ? id.join(', ') : id;
    super(`Not Found using ID ${idsMessage}`);
    this.name = 'NotFoundError';
  }
}
