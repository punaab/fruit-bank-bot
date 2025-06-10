declare module 'discord-webhook-node' {
  export class Webhook {
    constructor(url: string);
    send(payload: any): Promise<void>;
  }

  export class MessageBuilder {
    constructor();
    setTitle(title: string): this;
    setDescription(description: string): this;
    setColor(color: string): this;
    addField(name: string, value: string, inline?: boolean): this;
    setTimestamp(): this;
    setFooter(text: string, icon?: string): this;
    setAuthor(name: string, icon?: string, url?: string): this;
    setThumbnail(url: string): this;
    setImage(url: string): this;
    setURL(url: string): this;
    getJSON(): any;
  }
} 