!function () {
    const $SwitchCategory = $(`.switch-category`), $ItemList = $(`.item-list`), categoryId = getVar("CAT_ID");
    const $noticePanel = $('#homepage-notice-panel');
    const $noticeToggle = $('#homepage-notice-toggle');
    const $noticeBody = $('#homepage-notice-body');
    const $noticeToggleIcon = $('#homepage-notice-toggle-icon');
    let noticeModalIndex = null;

    function setNoticePanelState(open) {
        if (open) {
            $noticeBody.stop(true, true).slideDown(150);
            $noticeToggle.attr('aria-expanded', 'true');
            $noticeToggleIcon.removeClass('fa-angle-down').addClass('fa-angle-up');
        } else {
            $noticeBody.stop(true, true).slideUp(150);
            $noticeToggle.attr('aria-expanded', 'false');
            $noticeToggleIcon.removeClass('fa-angle-up').addClass('fa-angle-down');
        }
    }

    function bindNoticeToggle() {
        if (!$noticeToggle.length || !$noticeBody.length) return;
        $noticeToggle.on('click', function () {
            const isOpen = $noticeBody.is(':visible');
            setNoticePanelState(!isOpen);
        });
        $noticeToggle.on('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isOpen = $noticeBody.is(':visible');
                setNoticePanelState(!isOpen);
            }
        });
    }

    function openMandatoryNoticeModal() {
        if (!$noticeBody.length || !$noticeBody.html().trim()) return;

        const noticeHtml = $noticeBody.html();
        const panelWidth = Math.ceil($noticePanel.outerWidth() || 760);
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        const modalWidth = Math.max(320, Math.min(panelWidth, Math.floor(vw * 0.9), 920));
        const contentMaxHeight = Math.max(220, Math.floor(vh * 0.58));
        const isMobile = !util.isPc();
        const content = `
          <div class="acg-notice-modal-wrap">
            <div class="acg-notice-modal-content" style="max-height:${contentMaxHeight}px;overflow:auto;">${noticeHtml}</div>
            <div style="text-align:center;margin-top:14px;">
              <button type="button" class="btn btn-primary" id="acg-notice-confirm-btn" style="min-width:220px;">
                已阅读，确认下单
              </button>
            </div>
          </div>
        `;

        noticeModalIndex = layer.open({
            type: 1,
            title: '<i class="fa-duotone fa-regular fa-bullhorn"></i> 公告',
            shade: 0.55,
            shadeClose: false,
            closeBtn: 0,
            btn: [],
            area: isMobile ? [Math.min(96, Math.floor((modalWidth / vw) * 100)) + '%', 'auto'] : [modalWidth + 'px', 'auto'],
            maxWidth: 960,
            content: content,
            success: function () {
                $('#acg-notice-confirm-btn').off('click').on('click', function () {
                    if (noticeModalIndex !== null) {
                        layer.close(noticeModalIndex);
                        noticeModalIndex = null;
                    }
                    setNoticePanelState(false);
                });
            },
            end: function () {
                noticeModalIndex = null;
            }
        });
    }


    function _PushCommodityList(data) {
        $ItemList.html("");

        if (data.length == 0) {
            layer.msg("没有商品");
            $ItemList.html(`<div style="margin-right: 10px;margin-top:10px;font-size: 1.1rem;">没有商品</div>`);
            return;
        }

        data.forEach(item => {
            const isSoldOut = item.stock == 0;
            $ItemList.append(`<a href="${!isSoldOut ? `/item/${item.id}` : `javascript:void(0);`}" class="col-12 col-md-6 col-lg-3 mb-3" data-id="${item.id}">
          <div class="acg-card ${isSoldOut ? `soldout` : ``} h-100">
            <div class="acg-thumb" style="background: url('${item.cover}') center/cover no-repeat;"></div>
            <div class="p-3">
              <div class="tags">
              <span class="badge-soft badge-soft-success">${item.delivery_way === 0 ? '自动发货' : '在线发货'}</span>
              ${item.recommend == 1 ? `<span class="badge-soft badge-soft-primary">推荐</span>` : ``}
              </div>
              <p class="goods-title">${item.name}</p>
              <div class="stat-row mb-1">
                <div class="price"><span class="unit">¥</span>${item.price}</div>
              </div>
              <div class="stat-bottom"><span>库存：${item.stock}</span><span>已售：${item.order_sold}</span></div>
            </div>
            ${isSoldOut ? `<div class="soldout-ribbon">售罄</div>` : ``}
          </div>
        </a>`);
        });
    }

    function _SwitchCategory(id, link = false) {
        $SwitchCategory.removeClass("is-primary");
        $(`a[data-id=${id}]`).addClass("is-primary");
        if (link) {
            history.pushState(null, '', `/cat/${id}`);
        }
        trade.getCommodityList({
            categoryId: id,
            done: data => {
                _PushCommodityList(data);
            }
        });
    }


    function _Search(keywords) {
        if (keywords == '') {
            layer.msg("请输入要搜索的商品名称关键词");
            return;
        }

        $SwitchCategory.removeClass("is-primary");

        trade.getCommodityList({
            keywords: keywords,
            done: data => {
                _PushCommodityList(data);
            }
        });
    }


    //初次加载
    _SwitchCategory(categoryId > 0 ? categoryId : $SwitchCategory.first().data("id"));
    bindNoticeToggle();
    setNoticePanelState(true);
    openMandatoryNoticeModal();


    $SwitchCategory.click(function () {
        if ($(this).hasClass("is-primary")) {
            return;
        }
        _SwitchCategory($(this).data("id"), true);
    });


    $('.item-search-input').on('keypress', function (e) {
        if (e.which === 13) { // 或者 e.key === "Enter"
            _Search($(this).val());
        }
    });
}();
