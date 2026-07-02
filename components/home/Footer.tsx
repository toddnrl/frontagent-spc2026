export function Footer() {
  return (
    <footer className="bg-[#f9fafb] border-t border-gray-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-[10px] bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <span className="font-bold text-[20px] tracking-tight text-gray-900">Callbee</span>
            </div>
            <p className="text-[14px] text-gray-500 leading-[1.6] font-medium">
              Callbee는 인공지능 기술을 통해 비즈니스의 운영 방식을 혁신합니다.<br />
              고객 상담, 예약 관리, 업무 자동화를 하나의 플랫폼에서 경험하세요.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-5 text-[15px]">서비스</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">AI 전화 상담</a></li>
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">옴니채널 챗봇</a></li>
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">예약 자동화</a></li>
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">개발자 API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-5 text-[15px]">회사</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">제품 소개</a></li>
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">요금 안내</a></li>
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">도입 문의</a></li>
              <li><a href="#" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">고객 사례</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-5 text-[15px]">고객 지원</h4>
            <ul className="space-y-4">
              <li><a href="mailto:support@front.ai" className="text-[14px] font-medium text-gray-500 hover:text-gray-900">support@front.ai</a></li>
              <li><p className="text-[14px] font-medium text-gray-500">1588-0000</p></li>
              <li><p className="text-[13px] text-gray-400">평일 09:00 - 18:00<br/>(주말/공휴일 휴무)</p></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
          <p className="text-[13px] text-gray-400 font-medium tracking-wide">
            © 2024 Callbee Inc. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-[13px] font-medium text-gray-500 hover:text-gray-900">이용약관</a>
            <a href="#" className="text-[13px] font-bold text-gray-700 hover:text-gray-900">개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
