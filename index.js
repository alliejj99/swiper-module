document.addEventListener("DOMContentLoaded", function () {

  // Swiper에서 허용하는 공식 옵션 목록 정의
  const VALID_DATA_OPTIONS = {
    arrow: { type: 'boolean', default: false },
    full: { type: 'boolean', default: false },
    lazy: { type: 'boolean', default: true },
    center: { type: 'boolean', default: false },
    perview: { type: 'number', default: 0 },
    spaceBetween: { type: 'number', default: 20 },
    infinite: { type: 'boolean', default: false },
    autoplay: { type: 'boolean', default: false },
    speed: { type: 'number', default: 600 },
    effect: { type: 'effect', default: 'slide' },
    offsetAfter: { type: 'boolean', default: false }
  };
  // 슬라이드 높이 일괄 고정 여부 (data-equal-height). 기본 true
  VALID_DATA_OPTIONS.equalHeight = { type: 'boolean', default: true };

  // effect 종류
  const VALID_EFFECT_TYPES = ['slide', 'fade', 'cube', 'coverflow', 'flip', 'cards'];

  document.querySelectorAll('.swiper-module').forEach(function (wrapper, index) {
    var dataset = wrapper.dataset;
    var swiperEl = wrapper.querySelector('.swiper');
    var allSlides = Array.from(swiperEl.querySelectorAll('.swiper-slide'));
    const isSmallScreen = window.innerWidth <= 800;

    // ---------------------------
    // 슬라이드 비어있음 체크
    // ---------------------------
    allSlides.forEach(function (slide) {
      const isEmpty = slide.textContent.trim() === '' && !slide.querySelector('img, video, picture');
      if (isEmpty) {
        if (isSmallScreen) {
          slide.remove();
        } else {
          slide.classList.add('swiper-slide-disabled');
          slide.setAttribute('aria-hidden', 'true');
          slide.innerHTML = '&nbsp;';
        }
      }
    });

    var allSlidesAfterEmptyRemove = Array.from(swiperEl.querySelectorAll('.swiper-slide'));
    var validSlides = allSlidesAfterEmptyRemove.filter(slide => !slide.classList.contains('swiper-slide-disabled'));

    var warn = function (attr, message) {
      console.warn(
        '%c[해당 경고는 스킨관리 - sub_sd에서 발생합니다.]\n- Swiper data 옵션 오류 발생!\n- [data-swiper-index=' +
        index +
        ']\n- data-' +
        attr +
        ': ' +
        message,
        'color: #2f92f5;'
      );
    };

    // ---------------------------
    // 데이터 검증 함수
    // ---------------------------
    function validateAllDataOptions() {
      const existingKeys = Object.keys(dataset);

      // 실제 존재하는 data-* 키 검증
      existingKeys.forEach(key => {
        if (!VALID_DATA_OPTIONS[key]) {
          warn(key, '정의되지 않은 data-* 옵션입니다. 오타 또는 잘못된 속성일 가능성이 있습니다.');
        }
      });
    }

    // ---------------------------
    // 타입별 파싱
    // ---------------------------
    var parseNumber = function (value, fallback, attrName) {
      if (value === undefined || value === '') return fallback;
      var num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        warn(attrName, '유효하지 않은 숫자입니다. 기본값 ' + fallback + ' 사용되었습니다.');
        return fallback;
      }
      return num;
    };

    var parseBoolean = function (value, fallback, attrName) {
      if (value === undefined) return fallback;
      if (value !== 'true' && value !== 'false') {
        warn(attrName, 'true 또는 false만 허용됩니다. 기본값 ' + fallback + ' 사용되었습니다.');
        return fallback;
      }
      return value === 'true';
    };

    var parseEffect = function (value, fallback) {
      if (!value) return fallback;
      if (!VALID_EFFECT_TYPES.includes(value)) {
        warn(
          'effect',
          `"${value}"는 유효하지 않은 효과입니다. 가능: ${VALID_EFFECT_TYPES.join(', ')}. 기본값 ${fallback} 사용되었습니다.`
        );
        return fallback;
      }
      return value;
    };

    // ---------------------------
    // 전체 data-* 검증 수행
    // ---------------------------
    validateAllDataOptions();

    // ---------------------------
    // 옵션 파싱
    // ---------------------------
    var isArrow = parseBoolean(dataset.arrow, VALID_DATA_OPTIONS.arrow.default, 'arrow');
    var isFull = parseBoolean(dataset.full, VALID_DATA_OPTIONS.full.default, 'full');
    var isLazy = parseBoolean(dataset.lazy, VALID_DATA_OPTIONS.lazy.default, 'lazy');
    var isCenter = parseBoolean(dataset.center, VALID_DATA_OPTIONS.center.default, 'center');
    var isEqualHeight = parseBoolean(dataset.equalHeight, VALID_DATA_OPTIONS.equalHeight.default, 'equalHeight');

    var options = {
      perview: parseNumber(dataset.perview, VALID_DATA_OPTIONS.perview.default, 'perview'),
      spaceBetween: parseNumber(dataset.spaceBetween, VALID_DATA_OPTIONS.spaceBetween.default, 'spaceBetween'),
      loop: parseBoolean(dataset.infinite, VALID_DATA_OPTIONS.infinite.default, 'infinite'),
      autoplay: parseBoolean(dataset.autoplay, VALID_DATA_OPTIONS.autoplay.default, 'autoplay'),
      speed: parseNumber(dataset.speed, VALID_DATA_OPTIONS.speed.default, 'speed'),
      effect: parseEffect(dataset.effect, VALID_DATA_OPTIONS.effect.default)
    };

    // ---------------------------
    // has-arrow 처리
    // ---------------------------
    if (isArrow) {
      validSlides.forEach(slide => slide.classList.remove('has-arrow'));

      let lastIdx = allSlidesAfterEmptyRemove.length - 1;
      let lastSlide = allSlidesAfterEmptyRemove[lastIdx];
      let lastSlideIsEmpty = lastSlide && lastSlide.classList.contains('swiper-slide-disabled');

      let exceptIdx = -1;
      if (lastSlideIsEmpty && lastIdx > 0) {
        let prevSlide = allSlidesAfterEmptyRemove[lastIdx - 1];
        if (validSlides.includes(prevSlide)) {
          exceptIdx = validSlides.indexOf(prevSlide);
        }
      }

      validSlides.forEach((slide, idx) => {
        const isLast = idx === validSlides.length - 1;
        if (!isLast && idx !== exceptIdx) {
          slide.classList.add('has-arrow');
        }
      });
    }

    // ---------------------------
    // 슬라이드 개수
    // ---------------------------
    var slides = swiperEl.querySelectorAll('.swiper-slide');
    var slideCount = slides.length;
    if (options.perview !== 0) slideCount = Number(options.perview);

    if (slideCount === 0) {
      console.warn(`[data-swiper-index=${index}] 유효한 슬라이드가 없어 Swiper를 초기화하지 않습니다.`);
      return;
    }

    wrapper.setAttribute('data-swiper-index', index);

    var nextBtn = swiperEl.querySelector('.swiper-button-next') || wrapper.querySelector('.swiper-button-next');
    var prevBtn = swiperEl.querySelector('.swiper-button-prev') || wrapper.querySelector('.swiper-button-prev');
    if (nextBtn) nextBtn.setAttribute('data-swiper-nav', index);
    if (prevBtn) prevBtn.setAttribute('data-swiper-nav', index);

    // ---------------------------
    // 반응형
    // ---------------------------
    var responsiveBreakpoints = isFull
    ? {
      0: { slidesPerView: 1.5, spaceBetween: isArrow ? 30 : 10 },
      350: { slidesPerView: 1.5, spaceBetween: isArrow ? 30 : 10 },
      500: { slidesPerView: 2.5, spaceBetween: isArrow ? 30 : 10 },
      801: { slidesPerView: options.perview || slideCount, spaceBetween: options.spaceBetween }
    }
    : {
      0: { slidesPerView: 1.5, spaceBetween: isArrow ? 30 : 10 },
      500: { slidesPerView: 2.5, spaceBetween: isArrow ? 30 : 10 },
      800: { slidesPerView: options.perview || 3.5, spaceBetween: isArrow ? 30 : 10 },
      1024: { slidesPerView: Math.min(4.5, options.perview || 4.5), spaceBetween: 10 },
      1440: { slidesPerView: Math.min(4.5, options.perview || 5), spaceBetween: options.spaceBetween },
      1441: { slidesPerView: options.perview || 5, spaceBetween: options.spaceBetween }
    };

    if (isFull) {
      if (nextBtn) nextBtn.classList.add('swiper-hidden');
      if (prevBtn) prevBtn.classList.add('swiper-hidden');
    }

    var useOffsetAfter = parseBoolean(dataset.offsetAfter, VALID_DATA_OPTIONS.offsetAfter.default, 'offsetAfter');
    var offsetAfter = useOffsetAfter ? swiperEl.offsetWidth * 0.05 : 0;

    // ---------------------------
    // Swiper 초기화 옵션
    // ---------------------------
    var swiperOptions = {
      slidesPerView: isFull ? slideCount : undefined,
      spaceBetween: options.spaceBetween,
      loop: options.loop,
      speed: options.speed,
      effect: options.effect,
      preloadImages: false,
      slidesOffsetAfter: offsetAfter,
      lazy: isLazy
      ? {
        loadPrevNext: true,
        loadOnTransitionStart: true
      }
      : false,
      autoplay: options.autoplay ? { delay: 2500 } : false,


      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      a11y: {
        enabled: true,
        prevSlideMessage: '이전 슬라이드로 이동',
        nextSlideMessage: '다음 슬라이드로 이동',
        firstSlideMessage: '첫 번째 슬라이드입니다',
        lastSlideMessage: '마지막 슬라이드입니다',
        paginationBulletMessage: '{{index}}번째 배너 보기'
      },
      centeredSlides: isCenter || false,
      breakpoints: responsiveBreakpoints
    };

    if (nextBtn && prevBtn && !isFull) {
      swiperOptions.navigation = {
        nextEl: nextBtn,
        prevEl: prevBtn
      };
    }

    var swiperInstance = new Swiper(swiperEl, swiperOptions);
    /* ======================================
    화면 진입 시 Swiper autoplay 시작
   ====================================== */

    if (options.autoplay) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(entry => {
            // 안전 검사: autoplay가 실제로 초기화되어 있는지 확인
            if (!swiperInstance || !swiperInstance.autoplay) return;
            if (entry.isIntersecting) {
              if (typeof swiperInstance.autoplay.start === 'function') swiperInstance.autoplay.start();
            } else {
              if (typeof swiperInstance.autoplay.stop === 'function') swiperInstance.autoplay.stop();
            }
          });
        },
        {
          threshold: 0.3
        }
      );

      observer.observe(wrapper);
    }

    // ---------------------------
    // 슬라이드 높이 통일
    // ---------------------------
    function fixSlideHeights() {
      var maxHeight = 0;
      slides.forEach(function (slide) {
        slide.style.height = 'auto';
        if (slide.scrollHeight > maxHeight) maxHeight = slide.scrollHeight;
      });
      slides.forEach(function (slide) {
        slide.style.height = maxHeight + 'px';
      });
    }

    // 간단한 디바운스 유틸리티 (리사이즈 이벤트 최적화)
    function debounce(fn, wait) {
      var t;
      return function () {
        var args = arguments;
        var ctx = this;
        clearTimeout(t);
        t = setTimeout(function () {
          fn.apply(ctx, args);
        }, wait);
      };
    }

    if (isEqualHeight) {
      fixSlideHeights();
    } else {
      // 사용자가 동일 높이를 원치 않으면 모든 슬라이드 높이를 auto로 유지
      slides.forEach(function (slide) {
        slide.style.height = 'auto';
      });
    }

    var images = swiperEl.querySelectorAll('img');
    var imagesToLoad = images.length;

    if (imagesToLoad > 0) {
      images.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', () => {
            imagesToLoad--;
            if (imagesToLoad === 0) fixSlideHeights();
          });
        } else {
          imagesToLoad--;
        }
      });

      if (imagesToLoad === 0) {
        if (isEqualHeight) {
          fixSlideHeights();
        } else {
          slides.forEach(function (slide) {
            slide.style.height = 'auto';
          });
        }
      }
    }

    if (isLazy && isEqualHeight) {
      swiperInstance.on('lazyImageReady', function () {
        fixSlideHeights();
      });
    }

    if (isEqualHeight) {
      setTimeout(fixSlideHeights, 100);
      window.addEventListener('resize', debounce(fixSlideHeights, 100));
    } else {
      // 동일 높이를 사용하지 않을 때는 리사이즈 시에도 auto 유지
      setTimeout(function () {
        slides.forEach(function (slide) {
          slide.style.height = 'auto';
        });
      }, 100);
      window.addEventListener('resize', debounce(function () {
        slides.forEach(function (slide) {
          slide.style.height = 'auto';
        });
      }, 100));
    }
  });
});
