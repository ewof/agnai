import { A, useLocation } from '@solidjs/router'
import {
  Activity,
  Bell,
  Book,
  ChevronRight,
  HeartHandshake,
  HelpCircle,
  LogIn,
  MailQuestion,
  MessageCircle,
  Moon,
  Plus,
  Settings,
  ShoppingBag,
  Sliders,
  Speaker,
  Sun,
  VenetianMask,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-solid'
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  Match,
  Show,
  Switch,
} from 'solid-js'
import AvatarIcon, { CharacterAvatar } from './shared/AvatarIcon'
import {
  UserState,
  audioStore,
  characterStore,
  inviteStore,
  settingStore,
  toastStore,
  userStore,
} from './store'
import Slot from './shared/Slot'
import { useEffect, usePaneManager, useRef, useResizeObserver, useWindowSize } from './shared/hooks'
import WizardIcon from './icons/WizardIcon'
import { soundEmitter } from './shared/Audio/playable-events'
import Tooltip from './shared/Tooltip'
import { DiscordDarkIcon, DiscordLightIcon } from './icons/DiscordIcon'
import { Badge } from './shared/Card'

const MobileNavHeader = () => {
  return (
    <div class="flex min-h-[2rem] justify-between sm:hidden">
      <div class="w-8"></div>
      <div></div>
      <div class="w-8">
        <div class="icon-button">
          <X onClick={settingStore.menu} />
        </div>
      </div>
    </div>
  )
}

const Navigation: Component = () => {
  let parent: any
  let content: any
  const state = settingStore()
  const user = userStore()
  const size = useWindowSize()
  const pane = usePaneManager()

  const suffix = createMemo(() => (user.sub?.level ?? -1 > 0 ? '+' : ''))

  createEffect(() => {
    if (!state.overlay && state.showMenu) {
      settingStore.menu()
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (!parent || !content) return

      parent.setAttribute('style', '')
      content.setAttribute('style', '')
    }, 50)

    return () => clearInterval(interval)
  })

  const hide = createMemo(() => {
    if (pane.showing() && !state.showMenu) return 'drawer--hide'
    if (state.showMenu) return ''
    return 'drawer--hide'
  })

  const fullscreen = createMemo(() => {
    if (state.fullscreen) return 'hidden'

    if (pane.showing() && size.width() <= 1200) {
      return 'hidden'
    }

    return ''
  })

  return (
    <>
      <div
        ref={parent}
        class={`drawer bg-800 flex flex-col gap-2 px-2 pt-2 ${hide()} ${fullscreen()}`}
        role="navigation"
        aria-label="Main"
      >
        <div ref={content} class="drawer__content sm:text-md text-md flex flex-col gap-0  sm:gap-1">
          <div class="hidden w-full items-center justify-center sm:flex">
            <A href="/" role="link" aria-label="Agnaistic main page">
              <div
                class="h-8 w-fit items-center justify-center rounded-lg font-bold"
                aria-hidden="true"
              >
                Agn<span class="text-[var(--hl-500)]">ai</span>
                {suffix()}
              </div>
            </A>
          </div>

          <MobileNavHeader />

          <Show when={user.loggedIn} fallback={<GuestNavigation />}>
            <UserNavigation />
          </Show>
        </div>

        <div
          class="absolute bottom-0 flex w-full flex-col items-center justify-between px-4"
          classList={{
            'h-8': state.config.policies,
            'h-4': !state.config.policies,
          }}
        >
          <Show when={state.config.policies}>
            <div class="text-500 flex w-full justify-center gap-4 text-xs">
              <div>
                <A href="/terms-of-service">Term of Service</A>
              </div>
              <div>
                <A href="/privacy-policy">Privacy Policy</A>
              </div>
            </div>
          </Show>
          <div class="text-500 mb-1 text-[0.6rem] italic" role="contentinfo" aria-label="Version">
            {state.config.version}
          </div>
        </div>
      </div>
    </>
  )
}

const UserNavigation: Component = () => {
  const user = userStore()
  const menu = settingStore()

  const guidance = createMemo(() => {
    const usable = menu.config.subs.some((sub) => sub.guidance)
    if (!usable) return false

    const access = !!menu.config.guidanceAccess || !!user.user?.admin
    return access
  })

  return (
    <>
      <UserProfile />

      <Show when={menu.flags.chub}>
        <Item href="/chub" ariaLabel="Character hub">
          <ShoppingBag aria-hidden="true" />
          CHUB
        </Item>
      </Show>

      <CharacterLink />

      <ChatLink />

      <Show when={guidance()}>
        <Item href="/saga" ariaLabel="Sagas Preview">
          <Wand2 aria-hidden="true" />
          Sagas Preview
        </Item>
      </Show>

      <Library />
      <MultiItem>
        <Item href="/presets" ariaLabel="Presets">
          <Sliders aria-hidden="true" />
          <span aria-hidden="true">Presets</span>
        </Item>
        <EndItem>
          <A class="icon-button" href="/presets/new" role="button" aria-label="Add a new preset">
            <Plus aria-hidden="true" />
          </A>
        </EndItem>
      </MultiItem>

      <Show when={menu.flags.sounds}>
        <Sounds />
      </Show>

      <Show when={user.user?.admin}>
        <Item href="/admin/metrics" ariaLabel="Manage">
          <Activity aria-hidden="true" />
          <span aria-hidden="true">Manage</span>
        </Item>
        <SubMenu>
          <SubItem href="/admin/configuration" parent="/" ariaLabel="Configuration">
            Configuration
          </SubItem>
          <SubItem href="/admin/users" parent="/" ariaLabel="Users">
            Users
          </SubItem>
          <SubItem href="/admin/subscriptions" parent="/" ariaLabel="Subscriptions">
            Subscriptions
          </SubItem>
          <SubItem href="/admin/announcements" parent="/" ariaLabel="Announcements">
            Announcements
          </SubItem>
        </SubMenu>
      </Show>

      <NavIcons
        supportEmail={menu.config.serverConfig?.supportEmail}
        patreon={menu.config.patreon}
        user={user}
        showMenu={menu.showMenu}
        mode={user.ui.mode}
      />

      <Slots />
    </>
  )
}

const GuestNavigation: Component = () => {
  const user = userStore()
  const menu = settingStore((s) => ({
    showMenu: s.showMenu,
    config: s.config,
    guest: s.guestAccessAllowed,
    flags: s.flags,
  }))

  return (
    <>
      <Show when={menu.config.canAuth}>
        <Item
          href="/login"
          ariaLabel="Login to the application"
          onClick={() => soundEmitter.emit('menu-item-clicked', 'login')}
        >
          <LogIn /> Login
        </Item>
      </Show>

      <Show when={menu.guest}>
        <UserProfile />

        <CharacterLink />

        <Show when={menu.flags.chub}>
          <Item href="/chub" ariaLabel="Character hub">
            <ShoppingBag aria-hidden="true" />
            CHUB
          </Item>
        </Show>

        <ChatLink />

        <Library />

        <MultiItem>
          <Item
            href="/presets"
            ariaLabel="Presets"
            onClick={() => soundEmitter.emit('menu-item-clicked', 'presets')}
          >
            <Sliders /> Presets
          </Item>
          <EndItem>
            <A class="icon-button" href="/presets/new" role="button" aria-label="Add a new preset">
              <Plus aria-hidden="true" />
            </A>
          </EndItem>
        </MultiItem>

        <Show when={menu.flags.sounds}>
          <Sounds />
        </Show>
      </Show>

      <NavIcons
        supportEmail={menu.config.serverConfig?.supportEmail}
        patreon={menu.config.patreon}
        user={user}
        showMenu={menu.showMenu}
        mode={user.ui.mode}
      />

      <Slots />
    </>
  )
}

const NavIcons: Component<{
  patreon?: boolean
  supportEmail?: string
  user: UserState
  showMenu: boolean
  mode: 'light' | 'dark'
}> = (props) => {
  const invites = inviteStore()
  const toasts = toastStore()

  const count = createMemo(() => {
    return toasts.unseen + invites.invites.length
  })

  return (
    <>
      <div class="flex flex-wrap justify-center gap-[2px] text-sm">
        <Show when={!!props.supportEmail}>
          <ExternalLink href={`mailto:${props.supportEmail}`} newtab ariaLabel="Email Support">
            <Tooltip position="top" tip={`${props.supportEmail}`}>
              <MailQuestion aria-hidden />
            </Tooltip>
          </ExternalLink>
        </Show>

        <Item href="/faq" ariaLabel="Open FAQ page">
          <HelpCircle aria-hidden="true" />
        </Item>

        <Item href="/settings" ariaLabel="Open settings page">
          <Settings aria-hidden="true" />
        </Item>

        <Item
          ariaLabel="Toggle between light and dark mode"
          onClick={() => {
            userStore.saveUI({ mode: props.user.ui.mode === 'light' ? 'dark' : 'light' })
          }}
        >
          <Show when={props.user.ui.mode === 'dark'} fallback={<Sun />}>
            <Moon aria-hidden="true" />
          </Show>
        </Item>

        <Item
          onClick={() => {
            if (props.showMenu) settingStore.closeMenu()
            toastStore.modal(true)
          }}
          ariaLabel="Show notification list"
        >
          <Switch>
            <Match when={count() > 0}>
              <div
                class="relative flex"
                role="status"
                aria-label={`Status: You have ${count()} new notifications`}
              >
                <Bell fill="var(--bg-100)" aria-hidden="true" />
                <span class="absolute bottom-[-0.5rem] right-[-0.5rem]" aria-hidden="true">
                  <Badge type="rose">{count() > 9 ? '9+' : count()}</Badge>
                </span>
              </div>
            </Match>

            <Match when={!count()}>
              <Bell color="var(--bg-500)" role="status" aria-label="Status: No new notifications" />
            </Match>
          </Switch>
        </Item>
      </div>
      <div class="flex flex-wrap justify-center gap-[2px] text-sm">
        <Show when={props.patreon}>
          <ExternalLink href="https://patreon.com/Agnaistic" newtab ariaLabel="Patreon">
            <HeartHandshake aria-hidden="true" />
          </ExternalLink>
        </Show>

        <ExternalLink href="https://discord.agnai.chat" newtab ariaLabel="Discord">
          <Show when={props.mode === 'dark'}>
            <DiscordLightIcon />
          </Show>
          <Show when={props.mode === 'light'}>
            <DiscordDarkIcon />
          </Show>
        </ExternalLink>
      </div>
    </>
  )
}

function onItemClick(onClick?: () => void) {
  return () => {
    onClick?.()
    const { showMenu } = settingStore.getState()
    if (showMenu) settingStore.closeMenu()
  }
}

const Item: Component<{
  href?: string
  ariaLabel?: string
  children: string | JSX.Element
  onClick?: () => void
}> = (props) => {
  return (
    <>
      <Show when={!props.href}>
        <div
          class="flex min-h-[2.5rem] cursor-pointer items-center justify-start gap-4 rounded-lg px-2 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
          onClick={onItemClick(props.onClick)}
          tabindex={0}
          role="button"
          aria-label={props.ariaLabel}
        >
          {props.children}
        </div>
      </Show>
      <Show when={props.href}>
        <A
          href={props.href!}
          class="flex min-h-[2.5rem] items-center justify-start gap-4 rounded-lg px-2 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
          onClick={onItemClick(props.onClick)}
          role="button"
          aria-label={props.ariaLabel}
        >
          {props.children}
        </A>
      </Show>
    </>
  )
}

const SubMenu: Component<{ children: any }> = (props) => <div class="bg-900">{props.children}</div>

const SubItem: Component<{
  parent: string
  href: string
  ariaLabel?: string
  children: string | JSX.Element
  onClick?: () => void
}> = (props) => {
  const loc = useLocation()
  return (
    <Show when={loc.pathname.startsWith(props.parent)}>
      <A
        activeClass="bg-[var(--hl-900)]"
        href={props.href!}
        class="flex min-h-[2.5rem] items-center justify-start gap-4 rounded-lg px-2 pl-4 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
        onClick={() => {
          if (settingStore.getState().showMenu) settingStore.closeMenu()
        }}
        role="button"
        aria-label={props.ariaLabel}
      >
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-hidden="true">{props.children}</span>
      </A>
    </Show>
  )
}

export default Navigation

const ExternalLink: Component<{
  href: string
  newtab?: boolean
  ariaLabel?: string
  children?: any
}> = (props) => (
  <a
    class="flex h-10 items-center justify-start gap-4 rounded-xl px-2 hover:bg-[var(--bg-700)] sm:h-12"
    href={props.href}
    target={props.newtab ? '_blank' : ''}
    role="link"
    aria-label={props.ariaLabel}
  >
    {props.children}
  </a>
)

const Library: Component<{}> = (props) => {
  return (
    <div class="grid w-full gap-2" style={{ 'grid-template-columns': '1fr 30px' }}>
      <Item
        href="/memory"
        ariaLabel="Library"
        onClick={() => soundEmitter.emit('menu-item-clicked', 'library')}
      >
        <Book aria-hidden="true" />
        <span aria-hidden="true"> Library </span>
      </Item>
    </div>
  )
}

const Sounds: Component<{}> = (props) => {
  const audioSettings = audioStore()

  return (
    <MultiItem>
      <Item href="/sounds" onClick={() => soundEmitter.emit('menu-item-clicked', 'sounds')}>
        <Speaker /> Sounds
      </Item>
      <EndItem>
        <a class="icon-button" onClick={() => audioStore.toggleMuteTrack('master')}>
          <Show when={audioSettings.tracks.master.muted}>
            <VolumeX />
          </Show>
          <Show when={!audioSettings.tracks.master.muted}>
            <Volume2 />
          </Show>
        </a>
      </EndItem>
    </MultiItem>
  )
}

const CharacterLink = () => {
  return (
    <MultiItem>
      <Item
        href="/character/list"
        ariaLabel="Characters"
        onClick={() => soundEmitter.emit('menu-item-clicked', 'characters')}
      >
        <WizardIcon aria-hidden="true" />
        <span aria-hidden="true"> Characters </span>
      </Item>
      <EndItem>
        <A class="icon-button" href="/editor" role="button" aria-label="Add a new character">
          <Plus aria-hidden="true" />
        </A>
      </EndItem>
    </MultiItem>
  )
}

const ChatLink = () => {
  return (
    <MultiItem>
      <Item
        href="/chats"
        ariaLabel="Chats"
        onClick={() => soundEmitter.emit('menu-item-clicked', 'chats')}
      >
        <MessageCircle fill="var(--bg-100)" aria-hidden="true" />
        <span aria-hidden="true"> Chats </span>
      </Item>
      <EndItem>
        <A class="icon-button" href="/chats/create" role="button" aria-label="Create a new chat">
          <Plus aria-hidden="true" />
        </A>
      </EndItem>
    </MultiItem>
  )
}

const UserProfile = () => {
  const chars = characterStore()
  const user = userStore()
  const menu = settingStore()

  return (
    <>
      <div
        class="grid w-full items-center justify-between gap-2"
        style={{
          'grid-template-columns': '1fr 30px',
        }}
      >
        <Item
          ariaLabel="Edit user profile"
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
            soundEmitter.emit('menu-item-clicked', 'profile')
            userStore.modal(true)
          }}
        >
          <Switch>
            <Match when={chars.impersonating}>
              <CharacterAvatar
                char={chars.impersonating!}
                format={{ corners: 'circle', size: 'xs' }}
              />
            </Match>

            <Match when>
              <AvatarIcon
                avatarUrl={chars.impersonating?.avatar || user.profile?.avatar}
                format={{ corners: 'circle', size: 'xs' }}
              />
            </Match>
          </Switch>
          <span aria-hidden="true">{chars.impersonating?.name || user.profile?.handle}</span>
        </Item>
        <div class="flex items-center">
          <a
            href="#"
            role="button"
            aria-label="Open impersonation menu"
            class="icon-button"
            onClick={() => {
              settingStore.toggleImpersonate(true)
              if (menu.showMenu) settingStore.closeMenu()
            }}
          >
            <VenetianMask aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  )
}

const MultiItem: Component<{ children: any }> = (props) => {
  return (
    <div class="grid w-full gap-2" style={{ 'grid-template-columns': '1fr 30px' }}>
      {props.children}
    </div>
  )
}

const EndItem: Component<{ children: any }> = (props) => {
  return <div class="flex items-center">{props.children}</div>
}

const Slots: Component = (props) => {
  const [ref, onRef] = useRef()
  const state = settingStore()
  const { load } = useResizeObserver()

  createEffect(() => {
    const ele = ref()
    if (ele) load(ele)
  })

  const [rendered, setRendered] = createSignal(false)

  createEffect(() => {
    if (rendered()) return

    if (state.showMenu) {
      setTimeout(() => setRendered(true), 500)
    }
  })

  return (
    <div ref={onRef} class="h-full w-full">
      <Slot parent={ref()} slot="menu" />
    </div>
  )
}
