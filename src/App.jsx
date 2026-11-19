import { useEffect, useRef, useState } from 'react'
import AccordionGallery from './components/AccordionGallery'
import AnimatedContent from './components/AnimatedContent'
import Beams from './components/Beams'
import BorderGlow from './components/BorderGlow'
import CircularCarousel from './components/CircularCarousel'
import WarpText from './components/WarpText'

const portableOffline = __PORTABLE_OFFLINE__
const githubPages = __GITHUB_PAGES__
const hashRouting = portableOffline || githubPages

function getRoutePath() {
  if (!hashRouting) return window.location.pathname
  if (!window.location.hash.startsWith('#/')) return '/'
  return window.location.hash.slice(1).split('#', 1)[0] || '/'
}

function getRouteAnchor() {
  if (!hashRouting) return window.location.hash
  const hash = window.location.hash
  if (!hash.startsWith('#/')) return hash
  const anchorIndex = hash.indexOf('#', 2)
  return anchorIndex < 0 ? '' : hash.slice(anchorIndex)
}

function pageHref(href) {
  if (!hashRouting) return href

  if (href.startsWith('#')) {
    return `#${getRoutePath()}#${href.slice(1)}`
  }

  if (!href.startsWith('/')) return href
  const anchorIndex = href.indexOf('#')
  const path = anchorIndex < 0 ? href : href.slice(0, anchorIndex)
  const anchor = anchorIndex < 0 ? '' : href.slice(anchorIndex + 1)
  return `#${path || '/'}${anchor ? `#${anchor}` : ''}`
}

const showcase = [
  { number: '01', title: '个人信息', image: '/media/home-01.webp', href: '/personal-information/' },
  { number: '02', title: '日常工作', image: '/media/home-02.webp', href: '/daily-work/' },
  { number: '03', title: 'AI 探索', image: '/media/home-03.webp', href: '/ai-exploration/' },
  { number: '04', title: '过往经历', image: '/media/home-05.webp', href: '/past-experiences/' },
]

const portfolioItems = [
  { image: '/media/portfolio-01.webp', label: '常规更新', alt: '常规更新作品封面', link: '/daily-work/#daily-video-works' },
  { image: '/media/portfolio-02.webp', label: 'AIGC X 营销视频', alt: 'AIGC 营销视频作品封面', link: '/ai-exploration/#ai-promo-carousel' },
  { image: '/media/portfolio-03.webp', label: 'AIGC X 产品视频', alt: 'AIGC 产品视频作品封面', link: '/ai-exploration/#ai-promo-carousel' },
  { image: '/media/portfolio-04.webp', label: 'AIGC X 主题曲视频', alt: 'AIGC 主题曲视频作品封面', link: '/ai-exploration/#ai-music-carousel' },
  { image: '/media/portfolio-05.webp', label: '产品摄影', alt: '产品摄影作品封面', link: '/past-experiences/#outdoor-product-visual-title' },
]

const navigationItems = [
  { label: '首页', href: '/' },
  { label: '个人信息', href: '/personal-information/' },
  { label: '日常工作', href: '/daily-work/' },
  { label: 'AI探索', href: '/ai-exploration/' },
  { label: '过往经历', href: '/past-experiences/' },
]

const dailyVideoItems = [
  { title: '刺猬牙胶', image: '/media/daily-videos/刺猬牙胶.webp', video: '/media/daily-videos/刺猬牙胶.webm' },
  { title: '萌耳餐盘', image: '/media/daily-videos/萌耳餐盘.webp', video: '/media/daily-videos/萌耳餐盘.webm' },
  { title: '企鹅牙胶', image: '/media/daily-videos/企鹅牙胶.webp', video: '/media/daily-videos/企鹅牙胶.webm' },
  { title: '拖鞋牙胶', image: '/media/daily-videos/拖鞋牙胶.webp', video: '/media/daily-videos/拖鞋牙胶.webm' },
  { title: '小鹿摇铃', image: '/media/daily-videos/小鹿摇铃.webp', video: '/media/daily-videos/小鹿摇铃.webm' },
  { title: '小鹿摇铃2', image: '/media/daily-videos/小鹿摇铃2.webp', video: '/media/daily-videos/小鹿摇铃2.webm' },
]

const aiVideoItems = [
  { title: 'AI主题曲1', image: '/media/ai-videos/AI主题曲1.jpg', video: '/media/ai-videos/AI主题曲1.webm' },
  { title: 'AI主题曲2', image: '/media/ai-videos/AI主题曲2.jpg', video: '/media/ai-videos/AI主题曲2.webm' },
  { title: 'AI主题曲3', image: '/media/ai-videos/AI主题曲3.jpg', video: '/media/ai-videos/AI主题曲3.webm' },
]

const aiPromoVideoItems = [
  { title: 'AI宣传视频', image: '/media/ai-promo-videos/AI宣传视频.webp', video: '/media/ai-promo-videos/AI宣传视频.webm' },
  { title: 'AI宣传视频2', image: '/media/ai-promo-videos/AI宣传视频2.webp', video: '/media/ai-promo-videos/AI宣传视频2.webm' },
]

const aiShortVideoItems = [
  { title: 'AI辅助剪辑', image: '/media/ai-assisted-short-video/AI辅助剪辑.webp', video: '/media/ai-assisted-short-video/AI辅助剪辑.webm' },
  { title: 'AI开头钩子', image: '/media/ai-assisted-short-video/AI开头钩子.webp', video: '/media/ai-assisted-short-video/AI开头钩子.webm' },
  { title: 'AI开头钩子2', image: '/media/ai-assisted-short-video/AI开头钩子2.webp', video: '/media/ai-assisted-short-video/AI开头钩子2.webm' },
  { title: 'AI开头钩子3', image: '/media/ai-assisted-short-video/AI开头钩子3.webp', video: '/media/ai-assisted-short-video/AI开头钩子3.webm' },
  { title: 'AI开头钩子4', image: '/media/ai-assisted-short-video/AI开头钩子4.webp', video: '/media/ai-assisted-short-video/AI开头钩子4.webm' },
]

function SiteNavigation({ currentPath }) {
  const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '')

  return (
    <nav className="site-navigation" aria-label="主要导航">
      <div className="site-navigation__inner">
        {navigationItems.map((item) => {
          const normalizedHref = item.href === '/' ? '/' : item.href.replace(/\/$/, '')
          const isActive =
            normalizedPath === normalizedHref ||
            (item.href === '/daily-work/' && normalizedPath.startsWith('/daily-work/videos/')) ||
            (item.href === '/ai-exploration/' && normalizedPath.startsWith('/ai-exploration/videos/'))

          return (
            <a
              className={`site-navigation__link${isActive ? ' is-active' : ''}`}
              href={pageHref(item.href)}
              aria-current={isActive ? 'page' : undefined}
              key={item.href}
            >
              {item.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function LineIcon({ type }) {
  if (type === 'product') {
    return (
      <svg className="personal-info__icon" viewBox="0 0 72 72" aria-hidden="true">
        <path d="m36 8 23 13v28L36 62 13 49V21L36 8Z M13 21l23 14 23-14 M36 35v27" />
        <path d="m25 15 23 13v14l-23-13V15Z" />
      </svg>
    )
  }

  if (type === 'photo') {
    return (
      <svg className="personal-info__icon" viewBox="0 0 72 72" aria-hidden="true">
        <rect x="9" y="20" width="54" height="38" rx="4" />
        <path d="m21 20 5-8h20l5 8 M36 29a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z M53 27h.01" />
      </svg>
    )
  }

  return (
    <svg className="personal-info__icon" viewBox="0 0 72 72" aria-hidden="true">
      <rect x="10" y="10" width="52" height="52" rx="8" />
      <path d="M23 48V24h26v24 M23 36h26 M36 24v24 M17 55h38" />
      <circle cx="36" cy="36" r="5" />
    </svg>
  )
}

function TypewriterText({ text, delay = 0 }) {
  const textRef = useRef(null)
  const [visibleLength, setVisibleLength] = useState(0)

  useEffect(() => {
    const element = textRef.current
    if (!element) return undefined

    let intervalId
    let startId
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return

      observer.disconnect()
      startId = window.setTimeout(() => {
        let current = 0
        intervalId = window.setInterval(() => {
          current += 1
          setVisibleLength(current)
          if (current >= text.length) window.clearInterval(intervalId)
        }, 40)
      }, delay)
    }, { threshold: 0.1 })

    observer.observe(element)
    return () => {
      observer.disconnect()
      if (startId) window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [text, delay])

  return <span ref={textRef} className="typewriter-text">{text.slice(0, visibleLength)}</span>
}

function PersonalInformationPage({ currentPath }) {
  const skillGroups = [
    {
      type: 'product',
      title: '产品相关',
      english: 'PRODUCT DESIGN',
      body: '简单的建模与渲染，主要使用Blender、Rhino等软件进行三维建模与渲染表现。',
    },
    {
      type: 'photo',
      title: '摄影摄像相关',
      english: 'PHOTOGRAPHY & VIDEOGRAPHY',
      body: '熟练使用索尼相机。拥有摄影与后期处理能力，独立完成前期拍摄到后期修图的完整流程，能够熟练使用Photoshop与Lightroom提升整体影像的表现力与艺术性。摄像方面，能够独立进行前期的场景搭建，灯光布置，视频素材的拍摄，在后期使用达芬奇调色与剪映进行剪辑。',
    },
    {
      type: 'aigc',
      title: 'AIGC相关',
      english: 'AIGC APPLICATION',
      body: '从2022年8月SD的面世再到后来ChatGPT的出现，再到comfyUI实现生成工作流程化，作为设计师，我始终在关注以及使用影像与图像方向新的生成技术，深度使用市面上主流的AI模型，并了解对应的优缺点，能够结合多方平台实现对文字，图像，影像处理上的效率提升。',
    },
  ]

  return (
    <main className="personal-info-page">
      <SiteNavigation currentPath={currentPath} />
      <Beams
        beamWidth={3}
        beamHeight={30}
        beamNumber={20}
        lightColor="#ffdfbd"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={30}
        beamColor="#000000"
        backgroundColor="#000000"
      />
      <aside className="personal-info__sticker" aria-label="个人信息名片">
        <AnimatedContent
          distance={150}
          direction="horizontal"
          reverse
          duration={3}
          ease="power3.out"
          initialOpacity={0.2}
          animateOpacity
          scale={1.05}
          threshold={0.2}
          className="personal-info__sticker-animation"
        >
          <img src="/media/personal-information-sticker.webp" alt="陈梓豪个人信息名片" />
        </AnimatedContent>
      </aside>
      <div className="personal-info__content">
        <section className="personal-info__education personal-reveal" style={{ '--reveal-delay': '80ms' }}>
          <div className="personal-info__education-line" aria-hidden="true" />
          <div className="personal-info__education-copy">
            <p className="personal-info__meta"><strong><TypewriterText text="2021.09-2025.06" delay={80} /></strong></p>
            <h1><TypewriterText text="广东工业大学" delay={240} /> <span>| </span><TypewriterText text="本科" delay={440} /></h1>
            <p><TypewriterText text="所学专业：产品设计专业" delay={560} /></p>
            <p><TypewriterText text="主修课程：设计心理学，用户调研，产品摄影，产品设计工程等" delay={680} /></p>
            <p><TypewriterText text="每个课程都完成了项目立项，团队搭建，分工合作，项目汇报与实物落地" delay={800} /></p>
          </div>
        </section>

        <section className="personal-info__skills">
          {skillGroups.map((group, index) => (
            <article className="personal-info__skill personal-reveal" style={{ '--reveal-delay': `${220 + index * 140}ms` }} key={group.english}>
              <div className="personal-info__skill-heading">
                <LineIcon type={group.type} />
                <div>
                  <h2><TypewriterText text={group.title} delay={1000 + index * 220} /></h2>
                  <p><TypewriterText text={group.english} delay={1200 + index * 220} /></p>
                </div>
              </div>
              <p className="personal-info__body"><TypewriterText text={group.body} delay={1400 + index * 220} /></p>
            </article>
          ))}
        </section>

        <footer className="personal-info__quote personal-reveal" style={{ '--reveal-delay': '700ms' }}>
          <p><TypewriterText text="了解产品，才能展现产品，了解用户，才能打动用户，产品设计的专业经历，让我在产品方向的视频上有着独到的优势" delay={1800} /></p>
          <p className="personal-info__quote-en"><TypewriterText text="Know the Product. Understand the User. Create What Matters." delay={2200} /></p>
        </footer>
      </div>
    </main>
  )
}

function WorkIcon({ type }) {
  if (type === 'production') {
    return (
      <svg className="daily-work__icon" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="25" cy="27" r="7" />
        <circle cx="47" cy="27" r="7" />
        <path d="M13 51c0-8 5-14 12-14s12 6 12 14 M35 51c0-8 5-14 12-14s12 6 12 14 M36 14v26 M29 20h14" />
      </svg>
    )
  }

  if (type === 'iteration') {
    return (
      <svg className="daily-work__icon" viewBox="0 0 72 72" aria-hidden="true">
        <rect x="11" y="18" width="39" height="32" rx="3" />
        <path d="m50 28 11-7v26l-11-7 M24 29h13 M24 38h8" />
      </svg>
    )
  }

  return (
    <svg className="daily-work__icon" viewBox="0 0 72 72" aria-hidden="true">
      <path d="m36 10 7.3 16.2L61 28.4 48.5 40.8 51.4 58 36 49.8 20.6 58l2.9-17.2L11 28.4l17.7-2.2L36 10Z" />
    </svg>
  )
}

function DailyWorkPage({ currentPath }) {
  const workGroups = [
    {
      type: 'production',
      title: '内容生产',
      english: 'CONTENT PRODUCTION',
      number: '01',
      body: '配合上级运营策略及投放需求，产出千川投流短视频内容。\n内容生产层面，独立负责全品类母婴产品系列化短视频产出。结合产品卖点与用户画像，完成视频框架搭建、拍摄分镜细化、投流文案撰写，统筹多版本视频剪辑、配音包装、成片输出，持续稳定产出适配千川投放的高质量投流短视频，保障投放内容高频迭代与标准化落地。',
    },
    {
      type: 'iteration',
      title: '内容迭代',
      english: 'CONTENT ITERATION',
      number: '02',
      body: '内容迭代层面，依托AI工具搭建高效爆款拆解体系，在飞书端完成母婴类目的爆款视频系统化复盘。深度拆解优质内容的脚本逻辑、镜头节奏、卖点呈现方式及用户痛点切入思路，沉淀可复用的内容创作方法论，持续优化视频叙事节奏与种草逻辑，有效提升内容起量率与投放转化效果。',
    },
    {
      type: 'material',
      title: '素材运营',
      english: 'MATERIAL OPERATION',
      number: '03',
      body: '素材运维层面，负责达人及素人宝妈实拍素材的审核筛选、画面调色、分类归档与素材库统筹管理。同步梳理并标准化产品拍摄规范与素材质量标准，从源头把控内容质感，提升素材复用效率，保障团队内容产出的稳定性与高质量输出。',
    },
  ]

  useEffect(() => {
    if (getRouteAnchor() !== '#daily-video-works') return undefined

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('daily-video-works')?.scrollIntoView({
        block: 'start',
        behavior: 'auto',
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentPath, getRouteAnchor()])

  return (
    <main className="daily-work-page">
      <SiteNavigation currentPath={currentPath} />
      <Beams
        beamWidth={3}
        beamHeight={30}
        beamNumber={20}
        lightColor="#d4b37e"
        speed={1.5}
        noiseIntensity={1.2}
        scale={0.24}
        rotation={30}
        beamColor="#000000"
        backgroundColor="#000000"
      />
      <div className="daily-work__texture" aria-hidden="true" />
      <header className="daily-work__header">
        <AnimatedContent
          distance={42}
          direction="horizontal"
          duration={1.1}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          threshold={0.1}
          className="daily-work__header-animation"
        >
          <div className="scriptwriting__heading daily-work__overview-heading">
            <span className="scriptwriting__number">01</span>
            <span className="scriptwriting__diagonal" aria-hidden="true" />
            <div>
              <h1>工作内容总览</h1>
              <p>WORK CONTENT OVERVIEW</p>
            </div>
          </div>
        </AnimatedContent>
        <AnimatedContent
          distance={42}
          direction="horizontal"
          duration={1.1}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          threshold={0.1}
          delay={0.2}
          className="daily-work__record-meta-animation"
        >
          <div className="daily-work__record" aria-label="工作记录 2025-2026">
            <span>WORK</span>
            <span>RECORD</span>
            <span>2025–2026</span>
          </div>
        </AnimatedContent>
      </header>

      <div className="daily-work__layout">
        <section className="daily-work__visual-column" aria-label="日常工作素材">
          <AnimatedContent
            distance={110}
            direction="horizontal"
            reverse
            duration={1.8}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={1.04}
            threshold={0.15}
            className="daily-work__visual-animation"
          >
            <figure className="daily-work__visual">
              <img src="/media/daily-work-cover.webp" alt="母婴短视频内容素材整理" />
              <span className="daily-work__corner daily-work__corner--top" aria-hidden="true" />
              <span className="daily-work__corner daily-work__corner--bottom" aria-hidden="true" />
            </figure>
          </AnimatedContent>
          <div className="daily-work__visual-caption">
            <span>SOCIAL MEDIA</span>
            <span>OPERATIONS</span>
            <i aria-hidden="true" />
            <b aria-hidden="true">///</b>
          </div>
        </section>

        <section className="daily-work__records" aria-label="工作内容记录">
          {workGroups.map((group, index) => {
            const itemDelay = index * 0.12

            return (
              <article className="daily-work__record-item" key={group.number}>
                <div className="daily-work__record-heading">
                  <AnimatedContent
                    distance={36}
                    direction="horizontal"
                    reverse
                    duration={1.05}
                    initialOpacity={0}
                    animateOpacity
                    threshold={0.14}
                    delay={itemDelay}
                    className="daily-work__icon-animation"
                  >
                  <div className="daily-work__icon-ring"><WorkIcon type={group.type} /></div>
                  </AnimatedContent>
                  <AnimatedContent
                    distance={48}
                    direction="horizontal"
                    duration={1.15}
                    initialOpacity={0}
                    animateOpacity
                    threshold={0.14}
                    delay={itemDelay + 0.12}
                    className="daily-work__title-animation"
                  >
                    <div className="daily-work__record-title">
                      <h2>{group.title}</h2>
                      <p>{group.english}</p>
                    </div>
                  </AnimatedContent>
                  <AnimatedContent
                    distance={34}
                    direction="horizontal"
                    duration={1.1}
                    initialOpacity={0}
                    animateOpacity
                    threshold={0.14}
                    delay={itemDelay + 0.22}
                    className="daily-work__number-animation"
                  >
                    <span className="daily-work__record-number">{group.number}</span>
                  </AnimatedContent>
                </div>
                <div className="daily-work__record-body">
                  <span className="daily-work__record-line" aria-hidden="true" />
                  <AnimatedContent
                    distance={54}
                    direction="horizontal"
                    duration={1.3}
                    initialOpacity={0}
                    animateOpacity
                    threshold={0.12}
                    delay={itemDelay + 0.3}
                    className="daily-work__body-animation"
                  >
                    <p>{group.body}</p>
                  </AnimatedContent>
                </div>
              </article>
            )
          })}
        </section>
      </div>

      <section className="scriptwriting" aria-labelledby="scriptwriting-title">
        <div className="scriptwriting__ornament" aria-hidden="true" />
        <div className="scriptwriting__copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            className="scriptwriting__heading-animation"
          >
            <header className="scriptwriting__heading">
              <span className="scriptwriting__number">02</span>
              <span className="scriptwriting__diagonal" aria-hidden="true" />
              <div>
                <h2 id="scriptwriting-title">短视频文案编写</h2>
                <p>SHORT VIDEO SCRIPTWRITING</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={54}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            delay={0.12}
          >
            <p className="scriptwriting__lead">从产品出发，从用户思考，让文字成为连接产品与用户的入口。</p>
          </AnimatedContent>

          <div className="scriptwriting__body">
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.2}
            >
              <p>产品设计的学习经历，让我习惯从<strong>用户需求、使用场景与行为动机</strong>出发理解产品。这种用户洞察能力也延伸到短视频文案中——不只是提炼产品卖点，而是思考用户真正关心什么、为什么产生需求，以及什么样的表达能够引发共鸣。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.3}
            >
              <p>通过<strong>用户洞察、产品理解、内容结构与情绪共鸣</strong>，将产品语言转化为更自然、更有传播力的短视频内容，并进一步连接选题、脚本、分镜与转化逻辑。</p>
            </AnimatedContent>
          </div>

          <AnimatedContent
            distance={40}
            direction="horizontal"
            reverse
            duration={1.1}
            initialOpacity={0}
            animateOpacity
            threshold={0.12}
            delay={0.36}
          >
            <blockquote className="scriptwriting__quote">了解产品，才能展现产品；了解用户，才能真正打动用户。</blockquote>
          </AnimatedContent>

        </div>

        <AnimatedContent
          distance={110}
          direction="horizontal"
          duration={1.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.025}
          threshold={0.16}
          delay={0.16}
          className="scriptwriting__visual-animation"
        >
          <figure className="scriptwriting__visual">
            <img src="/media/scriptwriting-visual.webp" alt="短视频文案编写项目界面展示" />
          </figure>
        </AnimatedContent>

        <div className="scriptwriting__footer-mark" aria-hidden="true">
          <span>INSIGHT</span>
          <span>TO IMPACT</span>
        </div>
      </section>

      <section className="scriptwriting lighting-set-design" aria-labelledby="lighting-set-design-title">
        <div className="scriptwriting__ornament" aria-hidden="true" />
        <div className="scriptwriting__copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            className="scriptwriting__heading-animation"
          >
            <header className="scriptwriting__heading">
              <span className="scriptwriting__number">03</span>
              <span className="scriptwriting__diagonal" aria-hidden="true" />
              <div>
                <h2 id="lighting-set-design-title">短视频布光置景</h2>
                <p>LIGHTING &amp; SET DESIGN</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={54}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            delay={0.12}
          >
            <p className="scriptwriting__lead">用光影表达情绪，用置景连接用户与产品间的想象</p>
          </AnimatedContent>

          <div className="scriptwriting__body">
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.2}
            >
              <p>围绕短视频内容的拍摄需求，从<strong>内容主题、镜头构图与视觉氛围</strong>出发进行空间规划与置景。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.3}
            >
              <p>根据脚本及产品表现需求，确定场景的整体风格、色彩关系与空间层次，完成家具、道具、装饰及生活化细节的搭配与调整。同时结合实际机位和拍摄景别，预留合理的镜头运动空间，让场景不仅满足画面的完整性，也能够适应不同角度、不同景别的连续拍摄。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.4}
            >
              <p>在布光上，根据不同内容的情绪与产品呈现需求设计主光、辅光及轮廓光，通过软光、硬光、遮光与反射等方式控制空间明暗关系，强化主体与背景之间的层次，使画面在保持自然生活感的同时具备更明确的视觉重点。在有限的影棚空间内，通过布景与灯光的协同，让场景服务于镜头，也让画面更贴合短视频的观看节奏与内容表达。</p>
            </AnimatedContent>
          </div>
        </div>

        <AnimatedContent
          distance={110}
          direction="horizontal"
          duration={1.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.025}
          threshold={0.16}
          delay={0.16}
          className="scriptwriting__visual-animation"
        >
          <figure className="scriptwriting__visual">
            <img src="/media/lighting-set-design.webp" alt="短视频拍摄现场的布光与置景" />
          </figure>
        </AnimatedContent>

        <div className="scriptwriting__footer-mark" aria-hidden="true">
          <span>LIGHT</span>
          <span>INTO SPACE</span>
        </div>
      </section>

      <section className="scriptwriting storyboard-production" aria-labelledby="storyboard-production-title">
        <div className="scriptwriting__ornament" aria-hidden="true" />
        <div className="scriptwriting__copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            className="scriptwriting__heading-animation"
          >
            <header className="scriptwriting__heading">
              <span className="scriptwriting__number">04</span>
              <span className="scriptwriting__diagonal" aria-hidden="true" />
              <div>
                <h2 id="storyboard-production-title">短视频分镜制作</h2>
                <p>STORYBOARD &amp; VIDEO PRODUCTION</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={54}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            delay={0.12}
          >
            <p className="scriptwriting__lead">从文案出发，让每一个镜头都有明确的表达。</p>
          </AnimatedContent>

          <div className="scriptwriting__body">
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.2}
            >
              <p>分镜设计中，会将文字中的<strong>情节、情绪与产品信息</strong>转化为具体的视觉语言。我会从内容目标与用户观看路径出发，梳理镜头顺序、景别、构图与画面重点，让抽象的文案能够被准确地呈现出来。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.3}
            >
              <p>在实际拍摄中，我进一步结合<strong>场景、光线、机位与镜头运动</strong>进行画面执行。通过拍摄前的分镜规划与现场调整，控制画面的节奏与信息传递，让每一个镜头不仅完成记录，也承担相应的内容表达。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.4}
            >
              <p>从<strong>分镜规划到现场拍摄</strong>，建立完整的视觉执行链路，让前期构思真正落到画面之中。</p>
            </AnimatedContent>
          </div>
        </div>

        <AnimatedContent
          distance={110}
          direction="horizontal"
          duration={1.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.025}
          threshold={0.16}
          delay={0.16}
          className="scriptwriting__visual-animation"
        >
          <figure className="scriptwriting__visual">
            <img src="/media/storyboard-production.webp" alt="短视频分镜规划与现场拍摄" />
          </figure>
        </AnimatedContent>

        <div className="scriptwriting__footer-mark" aria-hidden="true">
          <span>FRAME</span>
          <span>IN MOTION</span>
        </div>
      </section>

      <section className="scriptwriting color-grading-editing" aria-labelledby="color-grading-editing-title">
        <div className="scriptwriting__ornament" aria-hidden="true" />
        <div className="scriptwriting__copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            className="scriptwriting__heading-animation"
          >
            <header className="scriptwriting__heading">
              <span className="scriptwriting__number">05</span>
              <span className="scriptwriting__diagonal" aria-hidden="true" />
              <div>
                <h2 id="color-grading-editing-title">影像调色与剪辑</h2>
                <p>COLOR GRADING &amp; VIDEO EDITING</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={54}
            direction="horizontal"
            reverse
            duration={1.15}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            delay={0.12}
          >
            <p className="scriptwriting__lead">以色彩塑造情绪，以剪辑重构叙事。</p>
          </AnimatedContent>

          <div className="scriptwriting__body">
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.2}
            >
              <p>从素材整理到成片输出，通过镜头语言、节奏控制与色彩设计，探索影像背后的情绪表达。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.3}
            >
              <p>结合剪辑逻辑与视觉风格定位，对画面进行调色、光影调整与氛围塑造，使素材从记录转变为具有叙事性的视觉作品。</p>
            </AnimatedContent>
          </div>

          <AnimatedContent
            distance={40}
            direction="horizontal"
            reverse
            duration={1.1}
            initialOpacity={0}
            animateOpacity
            threshold={0.12}
            delay={0.36}
          >
            <blockquote className="scriptwriting__quote">每一次剪辑调色，都让产品更加深入人心。</blockquote>
          </AnimatedContent>
        </div>

        <AnimatedContent
          distance={110}
          direction="horizontal"
          duration={1.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.025}
          threshold={0.16}
          delay={0.16}
          className="scriptwriting__visual-animation"
        >
          <figure className="scriptwriting__visual">
            <img src="/media/color-grading-editing.webp" alt="影像调色与视频剪辑工作界面" />
          </figure>
        </AnimatedContent>

        <div className="scriptwriting__footer-mark" aria-hidden="true">
          <span>COLOR</span>
          <span>IN RHYTHM</span>
        </div>
      </section>

      <section
        className="daily-video-carousel-section"
        id="daily-video-works"
        aria-labelledby="daily-video-carousel-title"
      >
        <div className="daily-video-carousel-section__heading">
          <span className="scriptwriting__number">06</span>
          <span className="scriptwriting__diagonal" aria-hidden="true" />
          <div>
            <h2 id="daily-video-carousel-title">日常视频作品</h2>
            <p>DAILY VIDEO WORKS</p>
          </div>
        </div>
        <p className="daily-video-carousel-section__intro">点击作品进入视频页面。</p>
        <CircularCarousel
          className="daily-video-carousel"
          items={dailyVideoItems.map(item => ({
            src: item.image,
            title: item.title,
            alt: item.title + '视频封面',
            video: item.video,
            href: pageHref('/daily-work/videos/' + encodeURIComponent(item.title) + '/'),
          }))}
          cardWidth={270}
          aspectRatio={3 / 4}
          gap={32}
          interval={3}
          cornerRadius={16}
          ariaLabel="日常视频作品轮播"
        />
      </section>
    </main>
  )
}

function DailyVideoPage({ currentPath, item, isAiVideo = false, isAiPromoVideo = false }) {
  const videoRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const returnHref = item.isAiShortVideo
    ? '/ai-exploration/#ai-short-video-carousel'
    : isAiPromoVideo
      ? '/ai-exploration/#ai-promo-carousel'
      : isAiVideo
        ? '/ai-exploration/#ai-music-carousel'
        : '/daily-work/#daily-video-works'
  const pageLabel = item.isAiShortVideo
    ? 'AI-ASSISTED SHORT VIDEO WORKS'
    : isAiPromoVideo
      ? 'AI PRODUCT PROMOTIONAL VIDEO WORKS'
      : isAiVideo
        ? 'AI MUSIC VIDEO WORKS'
        : 'DAILY VIDEO WORKS'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const playVideo = () => {
      video.muted = true
      video.play().catch(() => {})
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === video)
    }

    video.addEventListener('canplay', playVideo, { once: true })
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    video.load()
    if (video.readyState >= 3) playVideo()

    return () => {
      video.removeEventListener('canplay', playVideo)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [item.video])

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
      return
    }
    video.requestFullscreen?.().catch(() => {})
  }

  return (
    <main className="daily-video-page">
      <SiteNavigation currentPath={currentPath} />
      <div className="daily-video-page__inner">
        <a className="daily-video-page__back" href={pageHref(returnHref)}>← 返回作品列表</a>
        <header className="daily-video-page__heading">
          <span className="scriptwriting__number">VIDEO</span>
          <div>
            <h1>{item.title}</h1>
            <p>{pageLabel}</p>
          </div>
        </header>
        <div className="daily-video-page__player">
          <video
            ref={videoRef}
            src={item.video}
            controls
            autoPlay
            muted
            playsInline
            preload="auto"
          />
        </div>
        <div className="daily-video-page__actions">
          <button type="button" onClick={toggleFullscreen}>
            {isFullscreen ? '退出放大' : '放大视频'}
          </button>
          <a href={pageHref(returnHref)}>返回作品列表</a>
        </div>
      </div>
    </main>
  )
}

function AiSectionIcon({ type }) {
  if (type === 'design') {
    return (
      <svg className="ai-exploration__icon" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="6" />
        <circle cx="17" cy="20" r="5" />
        <circle cx="55" cy="20" r="5" />
        <circle cx="17" cy="52" r="5" />
        <circle cx="55" cy="52" r="5" />
        <path d="M31 32 21 23M41 32l10-9M31 40l-10 9M41 40l10 9" />
      </svg>
    )
  }

  if (type === 'visual') {
    return (
      <svg className="ai-exploration__icon" viewBox="0 0 72 72" aria-hidden="true">
        <rect x="10" y="14" width="52" height="44" rx="4" />
        <circle cx="25" cy="28" r="5" />
        <path d="m15 50 14-13 10 8 8-7 10 12M16 21h40" />
      </svg>
    )
  }

  return (
    <svg className="ai-exploration__icon" viewBox="0 0 72 72" aria-hidden="true">
      <rect x="10" y="18" width="52" height="36" rx="4" />
      <path d="m29 28 15 8-15 8V28ZM16 61h40" />
    </svg>
  )
}

function AiExplorationPage({ currentPath }) {
  useEffect(() => {
    const routeAnchor = getRouteAnchor()
    const targetId = routeAnchor === '#ai-short-video-carousel'
      ? 'ai-short-video-carousel'
      : routeAnchor === '#ai-promo-carousel'
        ? 'ai-promo-carousel'
        : routeAnchor === '#ai-music-carousel'
          ? 'ai-music-carousel'
          : null

    if (!targetId) return

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start', behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentPath, getRouteAnchor()])

  const sections = [
    {
      type: 'design',
      number: '01',
      title: 'AI辅助设计',
      english: 'AI-ASSISTED DESIGN',
      paragraphs: [
        '围绕人工智能技术在工业设计领域的应用展开探索，将生成式AI融入产品概念开发与设计方案推演流程。',
        '在云巢工业设计公司实习期间，参与AI辅助工业设计实践，结合生成式AI工具完成好慷在家箱包设计、一山一会户外运动用品AI场景海报生成，以及卡式炉、纺车轮等产品概念视觉方案探索。通过AI辅助完成从创意发散、概念推演到视觉呈现的设计流程，提高产品方案探索效率，拓展工业设计中的创意表达方式。',
      ],
    },
    {
      type: 'visual',
      number: '02',
      title: 'AI视觉生成',
      english: 'AI VISUAL GENERATION',
      paragraphs: [
        '探索生成式AI在商业视觉设计中的应用，通过AI技术快速构建产品场景、品牌视觉及宣传物料。',
        '在餐饮品牌实习期间，将AI技术应用于品牌视觉内容生产，为真功夫旗下子品牌秦王拉面完成AI生成设计海报，结合品牌定位与视觉需求进行创意生成与方案优化，探索AI在商业视觉设计中的实际落地应用。',
      ],
    },
    {
      type: 'content',
      number: '03',
      title: 'AI内容生产',
      english: 'AI CONTENT PRODUCTION',
      paragraphs: [
        '将AI技术应用于视频内容制作流程，通过生成式工具提升视觉素材生产效率与内容创作灵活性。',
        '目前工作中持续深化AI在内容制作领域的应用，通过AI生成视频素材并结合后期剪辑，完成产品宣传片制作，实现从素材生成、画面构建到成片输出的完整内容生产流程。',
        '同时可以结合Blender与AI生成技术，对产品进行定向生成与视觉优化，有效降低非标产品在视频制作过程中的表现不稳定性。',
      ],
    },
  ]

  return (
    <main className="ai-exploration-page">
      <SiteNavigation currentPath={currentPath} />
      <Beams
        beamWidth={3}
        beamHeight={30}
        beamNumber={20}
        lightColor="#d4b37e"
        speed={1.2}
        noiseIntensity={1.1}
        scale={0.24}
        rotation={30}
        beamColor="#000000"
        backgroundColor="#000000"
      />
      <div className="ai-exploration__texture" aria-hidden="true" />

      <header className="ai-exploration__header">
        <AnimatedContent
          distance={54}
          direction="horizontal"
          reverse
          duration={1.15}
          initialOpacity={0}
          animateOpacity
          threshold={0.12}
          className="ai-exploration__header-animation"
        >
          <div>
            <p>EXPERIMENTS IN GENERATIVE TECHNOLOGY</p>
            <h1>AI探索</h1>
          </div>
        </AnimatedContent>
        <AnimatedContent
          distance={44}
          direction="horizontal"
          duration={1.1}
          initialOpacity={0}
          animateOpacity
          threshold={0.12}
          delay={0.16}
          className="ai-exploration__header-mark-animation"
        >
          <div className="ai-exploration__header-mark" aria-hidden="true">
            <span>AI</span>
            <span>IN MOTION</span>
          </div>
        </AnimatedContent>
      </header>

      <div className="ai-exploration__layout">
        <aside className="ai-exploration__visual-column">
          <AnimatedContent
            distance={100}
            direction="horizontal"
            reverse
            duration={1.6}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={1.025}
            threshold={0.12}
            className="ai-exploration__visual-animation"
          >
            <figure className="ai-exploration__visual">
              <img src="/media/ai-exploration-main.webp" alt="AI辅助设计、视觉生成与内容生产主视觉" />
            </figure>
          </AnimatedContent>
          <div className="ai-exploration__visual-caption" aria-hidden="true">
            <span>AI-ASSISTED</span>
            <span>DESIGN / VISUAL / CONTENT</span>
            <i />
            <b>///</b>
          </div>
        </aside>

        <section className="ai-exploration__records" aria-label="AI探索内容">
          {sections.map((section, index) => (
            <article className="ai-exploration__record" key={section.english}>
              <AnimatedContent
                distance={62}
                direction="horizontal"
                duration={1.1}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                threshold={0.16}
                className="ai-exploration__record-animation"
              >
                <header className="ai-exploration__record-heading">
                  <span className="ai-exploration__icon-ring">
                    <AiSectionIcon type={section.type} />
                  </span>
                  <div>
                    <h2>{section.title}</h2>
                    <p>{section.english}</p>
                  </div>
                  <span className="ai-exploration__record-number">{section.number}</span>
                </header>
              </AnimatedContent>

              <div className="ai-exploration__record-body">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <AnimatedContent
                    distance={48}
                    direction="horizontal"
                    duration={1.15}
                    ease="power3.out"
                    initialOpacity={0}
                    animateOpacity
                    threshold={0.14}
                    delay={0.12 + paragraphIndex * 0.1}
                    className="ai-exploration__body-animation"
                    key={paragraph}
                  >
                    <p>{paragraph}</p>
                  </AnimatedContent>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>

      <section className="ai-exploration__workflow" aria-labelledby="ai-product-design-work-title">
        <div className="ai-exploration__workflow-copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            className="ai-exploration__workflow-heading-animation"
          >
            <header className="ai-exploration__workflow-heading">
              <span className="ai-exploration__record-number ai-exploration__workflow-label">实习</span>
              <span className="ai-exploration__workflow-line" aria-hidden="true" />
              <div>
                <h2 id="ai-product-design-work-title">AIGC产品设计工作</h2>
                <p>AIGC PRODUCT DESIGN WORKFLOW</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={52}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            delay={0.12}
          >
            <p className="ai-exploration__workflow-lead">让AI高效生成，让人工判断真正落地。</p>
          </AnimatedContent>

          <div className="ai-exploration__workflow-body">
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.22}
            >
              <p>
                围绕客户需求与产品开发目标，探索AIGC在工业设计流程中的系统化应用，将零散的生成式AI工具整合为阶段化工作流，构建“<strong>需求解析 → 风格提案 → 线稿生成 → 产品生成 → 效果图表现 → 人工验证 → 工程落地</strong>”的标准化设计SOP。
              </p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.32}
            >
              <p>
                通过ComfyUI实现生成参数与视觉效果的可控迭代，将AI介入前期创意发散、概念推演及效果图表现环节，以更高效的方式完成从概念到视觉方案的快速输出，相较传统约两小时的草图产出进一步缩短设计周期并降低前期制作成本。
              </p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.42}
            >
              <p>
                该工作流在<strong>好慷在家箱包、赛肯纺车渔轮、卡式炉</strong>等项目中持续优化与验证，并延伸应用于一山一会户外品牌的海报、Banner、宣传册等商业视觉物料，实现“<strong>AI高效生成 + 人工专业判断</strong>”的协同设计模式，为团队AI设计工具的落地应用、流程标准化及培训推广提供实践支持。
              </p>
            </AnimatedContent>
          </div>
        </div>

        <AnimatedContent
          distance={110}
          direction="horizontal"
          duration={1.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.025}
          threshold={0.14}
          delay={0.16}
          className="ai-exploration__workflow-visual-animation"
        >
          <figure className="ai-exploration__workflow-visual">
            <img src="/media/ai-product-design-workflow.webp" alt="AIGC产品设计工作流项目主视觉" />
          </figure>
        </AnimatedContent>

      </section>

      <section className="ai-exploration__workflow ai-exploration__visual-generation" aria-labelledby="ai-visual-generation-title">
        <div className="ai-exploration__workflow-copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            className="ai-exploration__workflow-heading-animation"
          >
            <header className="ai-exploration__workflow-heading">
              <span className="ai-exploration__record-number ai-exploration__workflow-label">实习</span>
              <span className="ai-exploration__workflow-line" aria-hidden="true" />
              <div>
                <h2 id="ai-visual-generation-title">AI视觉生成</h2>
                <p>AI VISUAL GENERATION</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={52}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            delay={0.12}
          >
            <p className="ai-exploration__workflow-lead">让AI拓展创意可能，让设计创造商业价值。</p>
          </AnimatedContent>

          <div className="ai-exploration__workflow-body">
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.22}
            >
              <p>探索生成式AI在商业视觉设计中的应用，围绕产品特征、品牌定位与传播需求，通过创意生成、场景构建与视觉迭代，将设计构思转化为具有实际应用价值的视觉方案。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.32}
            >
              <p>在餐饮品牌实习期间，参与真功夫旗下子品牌秦王拉面的品牌视觉营销协作，运用AI生成技术完成宣传海报设计，并结合品牌调性与视觉需求进行方案优化。同时，参与新品海报延展、活动视频拍摄与后期剪辑，为门店区域性营销活动提供视觉支持。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.42}
            >
              <p>通过<strong>AI生成与人工设计相结合</strong>，探索从创意构思到视觉呈现的高效工作流程，并将其应用于品牌宣传与商业内容生产。</p>
            </AnimatedContent>
          </div>
        </div>

        <AnimatedContent
          distance={110}
          direction="horizontal"
          duration={1.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.025}
          threshold={0.14}
          delay={0.16}
          className="ai-exploration__workflow-visual-animation"
        >
          <figure className="ai-exploration__workflow-visual">
            <img src="/media/ai-visual-generation.webp" alt="AI视觉生成项目主视觉" />
          </figure>
        </AnimatedContent>

      </section>

      <section className="ai-exploration__video-generation" aria-labelledby="ai-video-generation-title">
        <div className="ai-exploration__video-generation-copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            className="ai-exploration__workflow-heading-animation"
          >
            <header className="ai-exploration__workflow-heading">
              <span className="ai-exploration__record-number ai-exploration__workflow-label">正职</span>
              <span className="ai-exploration__workflow-line" aria-hidden="true" />
              <div>
                <h2 id="ai-video-generation-title">AI视频生成</h2>
                <p>AI VIDEO GENERATION</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={52}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            delay={0.12}
          >
            <p className="ai-exploration__video-generation-lead">让AI拓展视频创作的可能，让制作流程更加高效。</p>
          </AnimatedContent>

          <div className="ai-exploration__video-generation-body">
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.22}
            >
              <p>将生成式AI应用于视频内容制作流程，通过AI生成视频素材，结合后期剪辑与画面构建，完成从<strong>素材生成、视觉呈现到成片输出</strong>的完整内容生产。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.32}
            >
              <p>在实际制作中，持续探索AI在产品视频中的应用，并结合<strong>Blender与AI生成技术</strong>进行产品定向生成与视觉优化，使非标产品能够获得更加稳定、可控的视觉表现。</p>
            </AnimatedContent>
            <AnimatedContent
              distance={46}
              direction="horizontal"
              reverse
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              threshold={0.14}
              delay={0.42}
            >
              <p>通过AI与传统视频制作流程的结合，提升素材生产效率与内容创作的灵活性，同时降低复杂产品在视频制作中的实现成本。</p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      <div className="ai-exploration__project-group ai-exploration__music-project-group">
      <section className="ai-exploration__music-section" id="ai-music-generation" aria-labelledby="ai-music-generation-title">
        <div className="ai-exploration__music-copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            className="ai-exploration__workflow-heading-animation"
          >
            <header className="ai-exploration__workflow-heading">
              <span className="ai-exploration__record-number ai-exploration__workflow-label">01</span>
              <span className="ai-exploration__workflow-line" aria-hidden="true" />
              <div>
                <h2 id="ai-music-generation-title">AIGC音乐 X 产品视频</h2>
                <p>AIGC MUSIC X PRODUCT VIDEO</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={52}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            delay={0.12}
          >
            <p className="ai-exploration__music-lead">让产品卖点成为旋律，让音乐参与内容表达。</p>
          </AnimatedContent>

          <div className="ai-exploration__music-body">
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.22}>
              <p>在视频内容制作过程中，运用<strong>Suno</strong>进行主题曲与背景音乐生成，根据不同视频的内容定位、产品卖点与目标受众，设计具有明确主题和记忆点的音乐内容。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.32}>
              <p>首先从视频脚本与产品信息中提炼核心卖点，将原本需要通过旁白或字幕传递的信息重新转化为<strong>歌词内容</strong>。根据产品功能、使用场景与用户痛点设计歌词结构，将关键卖点自然融入主歌、副歌与重复段落，使产品信息能够随着旋律被持续强化，而不是以单纯口播的方式集中输出。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.42}>
              <p>在音乐生成阶段，根据视频整体调性选择相应的<strong>音乐风格、节奏、情绪与人声表现</strong>，通过多轮生成与筛选确定适合内容的音乐方案。针对不同的视频节奏，对歌曲的前奏、高潮、重复段落与重点歌词进行调整，使音乐能够与视频的镜头切换和内容节点形成对应关系。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.52}>
              <p>后期剪辑中，将音乐作为视频节奏的重要组成部分，根据歌词与鼓点安排<strong>镜头切换、产品展示、卖点出现及情绪高潮</strong>。通过音乐节奏与视觉内容的同步，让用户在观看过程中持续获得新的信息与节奏变化，从而增强内容的完整性、记忆点与观看兴趣。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.62}>
              <p>最终形成从<strong>卖点提炼 → 歌词创作 → AI作曲 → 音乐筛选 → 节奏剪辑 → 成片输出</strong>的完整工作流程，将AI音乐从单纯的背景素材转化为参与产品表达和内容结构设计的一部分，从而提高用户的留存率，更愿意了解产品卖点。</p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      <section className="ai-exploration__music-carousel-section" id="ai-music-carousel" aria-labelledby="ai-music-carousel-title">
        <div className="ai-exploration__music-carousel-heading">
          <span className="ai-exploration__record-number">VIDEO</span>
          <span className="ai-exploration__workflow-line" aria-hidden="true" />
          <div>
            <h2 id="ai-music-carousel-title">AI主题曲作品</h2>
            <p>AI MUSIC VIDEO WORKS</p>
          </div>
        </div>
        <p className="ai-exploration__music-carousel-intro">点击作品进入视频页面，滚轮或左右箭头切换作品。</p>
        <CircularCarousel
          className="ai-music-carousel"
          ariaLabel="AI主题曲视频作品轮播"
          items={aiVideoItems.map(item => ({
            src: item.image,
            title: item.title,
            alt: item.title + '视频预览',
            video: item.video,
            href: pageHref('/ai-exploration/videos/' + encodeURIComponent(item.title) + '/'),
          }))}
          cardWidth={270}
          aspectRatio={3 / 4}
          gap={32}
          interval={3}
          cornerRadius={16}
        />
      </section>
      </div>

      <div className="ai-exploration__project-group ai-exploration__promo-project-group">
      <section className="ai-exploration__video-generation ai-exploration__promo-section" aria-labelledby="ai-promo-title">
        <div className="ai-exploration__video-generation-copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            className="ai-exploration__workflow-heading-animation"
          >
            <header className="ai-exploration__workflow-heading">
              <span className="ai-exploration__record-number ai-exploration__workflow-label">02</span>
              <span className="ai-exploration__workflow-line" aria-hidden="true" />
              <div>
                <h2 id="ai-promo-title">AI产品宣传视频生成</h2>
                <p>AI PRODUCT PROMOTIONAL VIDEO GENERATION</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={52}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            delay={0.12}
          >
            <p className="ai-exploration__video-generation-lead">结合三维与生成式AI，让产品以更丰富的方式进入视频。</p>
          </AnimatedContent>

          <div className="ai-exploration__video-generation-body">
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.22}>
              <p>在产品宣传视频制作中，将<strong>Blender三维制作与AI视频生成技术</strong>结合使用，根据产品特点与宣传需求构建对应的视觉内容。针对传统拍摄难以实现的产品场景，通过三维与生成式技术提前设计产品的视觉呈现方式，并根据最终视频需求进行素材制作。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.32}>
              <p>首先对产品进行分析，根据产品的<strong>结构、比例、材质与使用方式</strong>确定视觉表现方案。在Blender中完成产品模型的整理、材质调整、灯光设置与基础场景搭建，通过控制产品角度、镜头位置、光影关系与运动方式，建立具有明确视觉重点的产品镜头。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.42}>
              <p>在此基础上，将Blender制作的产品画面与AI视频生成技术结合，根据不同镜头需求生成<strong>动态场景、环境变化、产品运动及氛围素材</strong>。对于现实拍摄成本较高、环境难以控制或非标产品表现不稳定的画面，通过AI生成拓展更多视觉方案，并根据产品实际特征不断调整生成结果，提高产品在不同场景中的一致性。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.52}>
              <p>在后期制作阶段，对三维素材与AI生成视频进行筛选、剪辑与合成，根据宣传片的内容结构重新组织镜头。通过<strong>镜头节奏、画面衔接、转场、音乐与产品信息</strong>的结合，将不同来源的视觉素材统一到同一套视觉语言中，使AI生成素材不再作为独立片段存在，而是服务于完整的视频叙事。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.62}>
              <p>最终形成从<strong>产品分析 → Blender视觉构建 → AI视频生成 → 素材筛选 → 后期剪辑 → 宣传片输出</strong>的完整制作流程，在降低传统拍摄限制的同时，提高复杂产品与特殊场景的视觉实现效率。</p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      <section className="ai-exploration__music-carousel-section ai-exploration__promo-carousel-section" id="ai-promo-carousel" aria-labelledby="ai-promo-carousel-title">
        <div className="ai-exploration__music-carousel-heading">
          <span className="ai-exploration__record-number">VIDEO</span>
          <span className="ai-exploration__workflow-line" aria-hidden="true" />
          <div>
            <h2 id="ai-promo-carousel-title">AI宣传视频作品</h2>
            <p>AI PRODUCT PROMOTIONAL VIDEO WORKS</p>
          </div>
        </div>
        <p className="ai-exploration__music-carousel-intro">点击作品进入视频页面，滚轮或左右箭头切换作品。</p>
        <CircularCarousel
          className="ai-promo-carousel"
          ariaLabel="AI产品宣传视频作品轮播"
          items={aiPromoVideoItems.map(item => ({
            src: item.image,
            title: item.title,
            alt: item.title + '视频封面',
            video: item.video,
            href: pageHref('/ai-exploration/videos/promo/' + encodeURIComponent(item.title) + '/'),
          }))}
          cardWidth={270}
          aspectRatio={3 / 4}
          gap={32}
          interval={3}
          cornerRadius={16}
        />
      </section>
      </div>

      <div className="ai-exploration__project-group ai-exploration__short-video-project-group">
      <section className="ai-exploration__video-generation ai-exploration__short-video-section" aria-labelledby="ai-short-video-title">
        <div className="ai-exploration__video-generation-copy">
          <AnimatedContent
            distance={72}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            className="ai-exploration__workflow-heading-animation"
          >
            <header className="ai-exploration__workflow-heading">
              <span className="ai-exploration__record-number ai-exploration__workflow-label">03</span>
              <span className="ai-exploration__workflow-line" aria-hidden="true" />
              <div>
                <h2 id="ai-short-video-title">AI辅助短视频创作</h2>
                <p>AI-ASSISTED SHORT VIDEO CREATION</p>
              </div>
            </header>
          </AnimatedContent>

          <AnimatedContent
            distance={52}
            direction="horizontal"
            reverse
            duration={1.15}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            threshold={0.14}
            delay={0.12}
          >
            <p className="ai-exploration__video-generation-lead">结合生成式AI与智能剪辑，提升视频创作效率与视觉表现力。</p>
          </AnimatedContent>

          <div className="ai-exploration__video-generation-body">
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.22}>
              <p>在短视频制作过程中，结合内容主题与传播需求，运用生成式AI设计并制作具有视觉吸引力的开头钩子视频，通过创意构思与提示词优化，将创意快速转化为视频素材，拓展视频的视觉表现形式。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.32}>
              <p>在后期制作阶段，利用AI辅助素材处理与剪辑工作，结合人工剪辑完成镜头筛选、节奏调整、画面衔接与音乐匹配，优化视频的叙事逻辑与整体观感。</p>
            </AnimatedContent>
            <AnimatedContent distance={46} direction="horizontal" reverse duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity threshold={0.14} delay={0.42}>
              <p>最终形成从<strong>创意策划 → AI视频生成 → 智能辅助剪辑 → 后期优化 → 成片输出</strong>的工作流程，在提升视频开头吸引力的同时，提高内容制作效率与成片质量。</p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      <section className="ai-exploration__music-carousel-section ai-exploration__short-video-carousel-section" id="ai-short-video-carousel" aria-labelledby="ai-short-video-carousel-title">
        <div className="ai-exploration__music-carousel-heading">
          <span className="ai-exploration__record-number">VIDEO</span>
          <span className="ai-exploration__workflow-line" aria-hidden="true" />
          <div>
            <h2 id="ai-short-video-carousel-title">AI辅助短视频作品</h2>
            <p>AI-ASSISTED SHORT VIDEO WORKS</p>
          </div>
        </div>
        <p className="ai-exploration__music-carousel-intro">点击作品进入视频页面，滚轮或左右箭头切换作品。</p>
        <CircularCarousel
          className="ai-short-video-carousel"
          ariaLabel="AI辅助短视频作品轮播"
          items={aiShortVideoItems.map(item => ({
            src: item.image,
            title: item.title,
            alt: item.title + '视频封面',
            video: item.video,
            href: pageHref('/ai-exploration/videos/short-video/' + encodeURIComponent(item.title) + '/'),
          }))}
          cardWidth={270}
          aspectRatio={3 / 4}
          gap={32}
          interval={3}
          cornerRadius={16}
        />
      </section>
      </div>

      <div className="ai-exploration__footer-mark" aria-hidden="true">
        <span>GENERATE</span>
        <span>EXPLORE</span>
        <span>REFINE</span>
      </div>
    </main>
  )
}

function PlaceholderPage({ currentPath }) {
  return (
    <main className="placeholder-page">
      <SiteNavigation currentPath={currentPath} />
    </main>
  )
}

function PastExperiencesPage({ currentPath }) {
  useEffect(() => {
    if (getRouteAnchor() !== '#outdoor-product-visual') return undefined

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('outdoor-product-visual')?.scrollIntoView({
        block: 'start',
        behavior: 'auto',
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentPath, getRouteAnchor()])

  return (
    <main className="past-experiences-page">
      <SiteNavigation currentPath={currentPath} />
      <Beams
        beamWidth={3}
        beamHeight={30}
        beamNumber={20}
        lightColor="#ffdfbd"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={30}
        beamColor="#000000"
        backgroundColor="#000000"
      />
      <div className="past-experiences__texture" aria-hidden="true" />

      <header className="past-experiences__header">
        <AnimatedContent distance={34} duration={0.8}>
          <div>
            <p>PAST EXPERIENCES</p>
            <h1>过往经历</h1>
          </div>
        </AnimatedContent>
      </header>

      <section className="past-experiences__project" aria-labelledby="product-design-practice-title">
        <AnimatedContent className="past-experiences__copy" distance={46} duration={0.95}>
          <div className="past-experiences__heading">
            <span className="past-experiences__number">01</span>
            <span className="past-experiences__line" aria-hidden="true" />
            <div>
              <h2 id="product-design-practice-title">产品设计实践</h2>
              <p>PRODUCT DESIGN PRACTICE</p>
            </div>
          </div>

          <div className="past-experiences__body">
            <p>围绕产品功能创新、地域文化转译与环保材料应用展开探索，通过不同类型的设计项目，实践从用户需求分析、产品概念构思到形态设计与材料表达的完整过程。</p>
            <p>在产品设计专业学习期间，完成沐浴手环、筇竹文创酒店门把手及“蒹葭”中草药渣回收材料包装盒等项目。沐浴手环侧重日常使用场景与产品功能的结合，探索产品形态与使用体验的优化；筇竹文创酒店门把手以地域竹文化为设计切入点，将传统材料特色融入现代酒店空间与五金产品设计；“蒹葭”包装盒则聚焦中草药渣的回收再利用，探索环保再生材料在包装设计中的应用。</p>
            <p>通过多元项目实践，逐步建立从用户需求、文化内涵到材料特性的综合设计思维，提升产品概念开发与设计落地能力。</p>
          </div>
        </AnimatedContent>

        <AnimatedContent className="past-experiences__visual-animation" distance={46} direction="horizontal" duration={1} delay={0.12}>
          <figure className="past-experiences__visual">
            <img src="/media/产品设计主视觉图.webp" alt="产品设计实践主视觉" />
          </figure>
        </AnimatedContent>
      </section>

      <section className="past-experiences__project" aria-labelledby="ai-industrial-designer-title">
        <AnimatedContent className="past-experiences__copy" distance={46} duration={0.95}>
          <div className="past-experiences__heading">
            <span className="past-experiences__number">02</span>
            <span className="past-experiences__line" aria-hidden="true" />
            <div>
              <h2 id="ai-industrial-designer-title">AI工业设计师实习</h2>
              <p>AI INDUSTRIAL DESIGNER INTERNSHIP</p>
            </div>
          </div>

          <div className="past-experiences__body">
            <p>围绕人工智能技术在工业设计流程中的应用展开探索，将 AI 工具融入产品概念构建、视觉表达、场景生成与设计深化等环节，尝试建立智能生成技术与传统设计流程结合的创新方式。</p>
            <p>在实习期间，参与不同类型的产品设计项目实践，从风格化产品设计、产品主题视觉构建到箱包产品开发，探索 AI 在工业设计各阶段中的应用价值。通过 AI 进行产品形态、材质与风格语言的快速探索，辅助完成不同设计方向的视觉验证；利用 AI 生成产品主题场景，将产品特征与用户情境结合，强化产品体验与情感表达；同时参与箱包类产品设计，从市场需求分析、产品定位到外观方案设计，尝试将 AI 辅助创意转化为实际产品设计方案。</p>
            <p>通过 AI 与工业设计流程的融合，逐步提升从概念发散、视觉探索到方案呈现的设计效率，建立人机协同的设计思维，探索未来智能化设计模式下工业设计师的更多可能性。</p>
          </div>
        </AnimatedContent>

        <AnimatedContent className="past-experiences__visual-animation" distance={46} direction="horizontal" duration={1} delay={0.12}>
          <figure className="past-experiences__visual">
            <img src="/media/ai-industrial-designer-internship.webp" alt="AI工业设计师实习项目主视觉" />
          </figure>
        </AnimatedContent>
      </section>

      <section className="past-experiences__project" id="outdoor-product-visual" aria-labelledby="outdoor-product-visual-title">
        <AnimatedContent className="past-experiences__copy" distance={46} duration={0.95}>
          <div className="past-experiences__heading">
            <span className="past-experiences__number">03</span>
            <span className="past-experiences__line" aria-hidden="true" />
            <div>
              <h2 id="outdoor-product-visual-title">户外产品影像创作</h2>
              <p>OUTDOOR PRODUCT VISUAL CREATION</p>
            </div>
          </div>

          <div className="past-experiences__body">
            <p>围绕户外生活方式品牌的产品传播需求展开摄影实践，通过产品跟踪拍摄、活动纪实摄影与场景化内容创作，探索如何利用影像语言展现产品特性与品牌理念，建立产品、场景与用户情感之间的连接。</p>
            <p>在实习期间，作为「一山一会」签约摄影师，负责户外产品的日常跟踪拍摄，将露营装备置于真实自然环境中进行视觉呈现。通过对光影、环境氛围与产品细节的把控，突出产品材质、结构与使用体验，将品牌倡导的“自由、冒险、轻松生活”的户外理念融入影像表达。同时参与 British Day 等品牌活动摄影，记录现场布展、互动体验、产品展示及用户参与等内容，为品牌社交媒体传播、活动回顾与商业合作提供视觉素材。</p>
            <p>在产品使用场景拍摄中，通过真实用户体验与动态画面呈现产品功能表现，展现产品在户外环境中的便携性、耐用性、稳定结构及多场景适用能力，使消费者能够直观感知产品价值，并通过具有生活方式属性的影像内容增强品牌信任感与情感认同。</p>
            <p>通过持续的户外摄影实践，逐步建立从产品理解、场景构建到品牌视觉传播的完整摄影思维，提升商业摄影与内容创作能力。</p>
          </div>
        </AnimatedContent>

        <AnimatedContent className="past-experiences__visual-animation" distance={46} direction="horizontal" duration={1} delay={0.12}>
          <figure className="past-experiences__visual">
            <img src="/media/outdoor-product-visual-creation.webp" alt="户外产品影像创作主视觉" />
          </figure>
        </AnimatedContent>
      </section>

      <section className="past-experiences__project" aria-labelledby="qin-wang-la-mian-title">
        <AnimatedContent className="past-experiences__copy" distance={46} duration={0.95}>
          <div className="past-experiences__heading">
            <span className="past-experiences__number">04</span>
            <span className="past-experiences__line" aria-hidden="true" />
            <div>
              <h2 id="qin-wang-la-mian-title">秦王拉面品牌视觉运营与内容设计</h2>
              <p>QIN WANG LA MIAN · BRAND VISUAL DESIGN &amp; SOCIAL MEDIA OPERATION</p>
            </div>
          </div>

          <div className="past-experiences__body">
            <p>在真功夫旗下品牌「秦王拉面」民田店实习期间，参与门店社群运营及品牌视觉内容设计工作，围绕区域营销活动需求，为品牌提供线上线下一体化视觉支持。</p>
            <p>根据主设计师创意方向，完成新品推广海报的延展设计与多场景适配，包括社交媒体传播物料、线下宣传海报及菜单插页等内容制作；同时参与活动视频素材拍摄与后期剪辑，协助构建品牌内容传播体系。</p>
            <p>通过与运营团队协作，优化素材发布节奏，并结合基础数据反馈分析内容表现，持续调整视觉策略，提升营销素材传播效率与用户触达效果。</p>
          </div>
        </AnimatedContent>

        <AnimatedContent className="past-experiences__visual-animation" distance={46} direction="horizontal" duration={1} delay={0.12}>
          <figure className="past-experiences__visual">
            <img src="/media/qin-wang-la-mian-brand-visual-design.webp" alt="秦王拉面品牌视觉运营与内容设计主视觉" />
          </figure>
        </AnimatedContent>
      </section>

      <div className="past-experiences__footer-mark" aria-hidden="true">
        <span>RESEARCH</span>
        <span>DESIGN</span>
        <span>APPLY</span>
      </div>
    </main>
  )
}

function App() {
  const [, setRouteRevision] = useState(0)
  const currentPath = getRoutePath()
  const routeAnchor = getRouteAnchor()

  useEffect(() => {
    if (!hashRouting) return undefined
    const updateRoute = () => setRouteRevision(revision => revision + 1)
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    if (!routeAnchor) return undefined

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(routeAnchor.slice(1))?.scrollIntoView({ block: 'start', behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentPath, routeAnchor])

  const aiVideoMatch = currentPath.match(/^\/ai-exploration\/videos\/([^/]+)\/?$/)
  if (aiVideoMatch) {
    const title = decodeURIComponent(aiVideoMatch[1])
    const item = aiVideoItems.find(video => video.title === title)
    if (item) return <DailyVideoPage currentPath={currentPath} item={item} isAiVideo />
  }

  const aiPromoVideoMatch = currentPath.match(/^\/ai-exploration\/videos\/promo\/([^/]+)\/?$/)
  if (aiPromoVideoMatch) {
    const title = decodeURIComponent(aiPromoVideoMatch[1])
    const item = aiPromoVideoItems.find(video => video.title === title)
    if (item) return <DailyVideoPage currentPath={currentPath} item={item} isAiPromoVideo />
  }

  const aiShortVideoMatch = currentPath.match(/^\/ai-exploration\/videos\/short-video\/([^/]+)\/?$/)
  if (aiShortVideoMatch) {
    const title = decodeURIComponent(aiShortVideoMatch[1])
    const item = aiShortVideoItems.find(video => video.title === title)
    if (item) return <DailyVideoPage currentPath={currentPath} item={{ ...item, isAiShortVideo: true }} />
  }

  const dailyVideoMatch = currentPath.match(/^\/daily-work\/videos\/([^/]+)\/?$/)
  if (dailyVideoMatch) {
    const title = decodeURIComponent(dailyVideoMatch[1])
    const item = dailyVideoItems.find(video => video.title === title)
    if (item) return <DailyVideoPage currentPath={currentPath} item={item} />
  }

  if (currentPath === '/personal-information/' || currentPath === '/personal-information') {
    return <PersonalInformationPage currentPath={currentPath} />
  }

  if (currentPath === '/daily-work/' || currentPath === '/daily-work') {
    return <DailyWorkPage currentPath={currentPath} />
  }

  if (currentPath === '/ai-exploration/' || currentPath === '/ai-exploration') {
    return <AiExplorationPage currentPath={currentPath} />
  }

  if (currentPath === '/past-experiences/' || currentPath === '/past-experiences') {
    return <PastExperiencesPage currentPath={currentPath} />
  }

  if (showcase.some((item) => item.href === currentPath)) {
    return <PlaceholderPage currentPath={currentPath} />
  }

  return (
    <main>
      <SiteNavigation currentPath={currentPath} />
      <section className="hero-study">
        <Beams
        beamWidth={3}
        beamHeight={30}
        beamNumber={20}
        lightColor="#ffdfbd"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={30}
        beamColor="#000000"
        backgroundColor="#000000"
        />
        <div className="hero-study__headline">
        <p className="hero-study__kicker">VIDEO EDITOR &amp; VISUAL CREATOR</p>
        <WarpText
          text="绝对求知"
          color="#f8f5ff"
          warpStrength={0.08}
          warpScale={1.7}
          speed={0.55}
          pointerInfluence={0.42}
          pointerStrength={0.38}
          refraction={0.018}
          ripple
          fontSize="clamp(3rem, 10vw, 9rem)"
          fontWeight={800}
          fontFamily='"Microsoft YaHei UI", "Microsoft YaHei", sans-serif'
          letterSpacing="0.08em"
          style={{ height: '320px' }}
        />
        <p className="hero-study__subtitle">保持探索，持续创造</p>
        <p className="hero-study__subtitle-en">CURIOSITY DRIVES CREATION.</p>
        <a className="hero-study__scroll-icon" href="#showcase" aria-label="查看下方内容">
          <svg viewBox="0 0 1024 1024" role="img">
            <path d="M509.98204 65.779146c-246.004857 0-446.147176 200.144366-446.147176 446.14513 0 245.99974 200.14232 446.137966 446.147176 446.137966 245.994624 0 446.137966-200.138226 446.137966-446.137966C956.120007 265.923512 755.977687 65.779146 509.98204 65.779146zM509.98204 902.295124c-215.258599 0-390.379035-175.111227-390.379035-390.370849 0-215.253482 175.12146-390.378012 390.379035-390.378012 215.250412 0 390.370849 175.12453 390.370849 390.378012C900.353912 727.183897 725.232452 902.295124 509.98204 902.295124zM720.184483 485.364363 537.857924 667.680688 537.857924 288.85478c0-15.415085-12.481266-27.888164-27.874861-27.888164-15.403828 0-27.885094 12.473079-27.885094 27.888164l0 378.825908L299.772434 485.364363c-10.889001-10.898211-28.535917-10.898211-39.426965 0-5.442966 5.442966-8.17417 12.58155-8.17417 19.709901 0 7.135514 2.731204 14.266935 8.17417 19.718087l229.918483 229.918483c10.891048 10.892071 28.535917 10.892071 39.434128 0l229.909274-229.918483c10.898211-10.891048 10.898211-28.538987 0-39.427988C748.7204 474.465129 731.071438 474.465129 720.184483 485.364363z" fill="currentColor" />
          </svg>
          <span>CLICK TO DISCOVER</span>
        </a>
        </div>
      </section>

        <section className="showcase" id="showcase" aria-label="作品集内容">
          {showcase.map((item) => (
            <a className="showcase__link" href={pageHref(item.href)} key={item.number}>
              <BorderGlow
                className="showcase__glow"
                edgeSensitivity={30}
                glowColor="42 100 65"
                backgroundColor="#120F17"
                borderRadius={28}
                glowRadius={40}
                glowIntensity={1.35}
                coneSpread={25}
                animated={false}
                colors={['#FFD166', '#F4C77A', '#721A22']}
                fillOpacity={0.35}
              >
                <figure className="showcase__item">
                  <img src={item.image} alt={item.title} />
                </figure>
              </BorderGlow>
            </a>
          ))}
        </section>

        <section className="featured-portfolio" id="portfolio" aria-labelledby="portfolio-title">
          <AnimatedContent
            distance={48}
            direction="vertical"
            reverse
            duration={1.1}
            initialOpacity={0}
            animateOpacity
            threshold={0.16}
            className="featured-portfolio__heading-animation"
          >
            <header className="featured-portfolio__heading">
              <div>
                <p>PORTFOLIO</p>
                <h2 id="portfolio-title">作品展示</h2>
              </div>
              <span className="featured-portfolio__line" aria-hidden="true" />
            </header>
          </AnimatedContent>
          <AnimatedContent
            distance={64}
            direction="vertical"
            duration={1.2}
            initialOpacity={0}
            animateOpacity
            threshold={0.1}
            delay={0.12}
            className="featured-portfolio__gallery-animation"
          >
            <AccordionGallery
              items={portfolioItems.map(item => ({ ...item, link: pageHref(item.link) }))}
              defaultIndex={0}
              accentColor="#d4b37e"
              overlayColor="#050403"
              textColor="#ffffff"
              height={560}
              gap={12}
              radius={18}
              expandRatio={0.52}
              duration={0.7}
              parallax={0.45}
              tilt={5}
              trigger="hover"
              grayscale
            />
          </AnimatedContent>
        </section>
    </main>
  )
}

export default App

