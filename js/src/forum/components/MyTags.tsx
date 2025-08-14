import type { Children, Vnode } from 'mithril';
import type { ComponentAttrs } from 'flarum/common/Component';
import Component from 'flarum/common/Component';
import app from 'flarum/forum/app';
import Separator from 'flarum/common/components/Separator';
import Link from 'flarum/common/components/Link';
import tagLabel from 'flarum/tags/common/helpers/tagLabel';
import type Tag from 'flarum/tags/common/models/Tag';

interface FollowableTag extends Tag {
  subscription: () => 'not_follow' | 'follow' | 'lurk' | 'ignore' | 'hide';
}

export default class extends Component {
  view(vnode: Vnode<ComponentAttrs, this>): Children {
    const all = app.store.all('tags') as FollowableTag[];

    // 原逻辑：关注 + 潜水
    const tags = all.filter((tag) => tag.subscription() === 'follow' || tag.subscription() === 'lurk');

    // 新增：屏蔽组
    const hidden = all.filter((tag) => tag.subscription() === 'hide');

    const showPlaceholder: boolean = app.forum.attribute('my-tags.enable-placeholder');

    // 只有当既没有已关注/潜水、也没有屏蔽，且不显示占位时才早退
    if (!tags.length && !hidden.length && !showPlaceholder) return;

    return (
      <>
        {/* 已关注/潜水 */}
        <div className="MyTags" role="group">
          <p className="MyTags__label">{app.translator.trans('acpl-my-tags.forum.index.my_tags')}</p>
          {!tags.length && showPlaceholder ? (
            <span>{app.translator.trans('acpl-my-tags.forum.index.placeholder', { a: <Link href={app.route('tags')} /> })}</span>
          ) : (
            <ul className="MyTags__list">
              {tags.map((tag) => (
                <li key={`myTags-tag-${tag.id()}`}>{tagLabel(tag, { link: app.route.tag(tag) })}</li>
              ))}
            </ul>
          )}
        </div>

        {/* 屏蔽（新增分组；只有有数据时才显示） */}
        {hidden.length > 0 && (
          <div className="MyTags" role="group">
            <p className="MyTags__label">{app.translator.trans('acpl-my-tags.forum.index.hidden_tags')}</p>
            <ul className="MyTags__list">
              {hidden.map((tag) => (
                <li key={`hiddenTags-tag-${tag.id()}`}>{tagLabel(tag, { link: app.route.tag(tag) })}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator />
      </>
    );
  }
}

